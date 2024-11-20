// markdown-to-html

import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
const COPY_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path>
          </svg>`;
let isListening = false;
let authToken = "";
let lastMessage = "";

async function convertMarkdownToHTML(content: string, index: number) {
  // Configure marked options
  const marked = new Marked({
    ...markedHighlight({
      emptyLangClass: "hljs",
      langPrefix: "hljs language-",
      highlight(code: string, lang: string) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    }),
  });

  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
  });

  // Custom renderer to override default HTML output
  const renderer = new marked.Renderer();

  // Customize code blocks
  renderer.code = ({ text, lang }) => {
    const html = `<pre class="!overflow-visible">
      <div class="contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative bg-token-sidebar-surface-primary dark:bg-gray-950">
        <div class="flex absolute top-0 w-full items-center text-token-text-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-md h-9 bg-token-sidebar-surface-primary dark:bg-token-main-surface-secondary select-none">
          <p>${lang || ""}</p>
          <button id="${index}-copy-button" class="flex gap-1 items-center select-none py-1">
            <span>Copy code</span>
             ${COPY_ICON}
          </button>
        </div>
        <div class="overflow-y-auto p-4" dir="ltr">
          <code class="!whitespace-pre hljs language-${lang}" id="${index}-code">${text}</code>
        </div>
      </div>
    </pre>`;

    // Create a MutationObserver to watch for when the elements are added
    const observer = new MutationObserver((mutations, obs) => {
      const codeElement = document.getElementById(`${index}-code`);
      const copyButton = document.getElementById(`${index}-copy-button`);

      if (codeElement && copyButton) {
        copyButton.addEventListener("click", () => {
          console.log(`Copying code from element ${index}`);
          navigator.clipboard.writeText(codeElement.textContent || "");
          copyButton.innerHTML = "<span>Copied!</span>" + COPY_ICON;
          setTimeout(() => {
            copyButton.innerHTML = "<span>Copy code</span>" + COPY_ICON;
          }, 1000);
        });

        // Once we've found and set up our elements, disconnect the observer
        obs.disconnect();
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return html;
  };

  // Customize inline code
  renderer.codespan = ({ text }) => {
    return `<code class="bg-token-surface-primary rounded px-1.5 py-0.5">${text}</code>`;
  };

  // Customize paragraphs
  renderer.paragraph = ({ text }) => {
    return `<p class="mb-4">${text}</p>`;
  };

  // Set the custom renderer
  marked.use({ renderer });

  // Convert markdown to HTML
  return marked.parse(content);
}

async function init() {
  console.log("Initializing content");
  requestAuthToken();
  addListeningButton();
}

async function retrieveLastConversation() {
  const conversationId = location.href.split("/c/")[1];
  if (!conversationId) {
    console.log("No conversation ID found");
    return;
  }
  const res = await fetch(
    `https://chatgpt.com/backend-api/conversation/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  const data = await res.json();

  const filteredMapping = Object.entries(data.mapping).filter(
    ([key, value]: [string, any]) =>
      value?.message?.author?.role === "assistant"
  );

  const entries = Object.entries(filteredMapping);
  const lastEntry: [string, any] = entries[entries.length - 1];
  const entry = lastEntry[1][1];
  const message = entry.message.content.parts[0].text;
  return message;
}

function requestAuthToken() {
  authToken =
    prompt(
      "Enter your auth token from your the cookie named `__Secure-next-auth.session-token.0` \n" +
        "Example: eyJhbGciOiJ... \n"
    ) || "";
}

async function retryListeningButtonAdd(retryCount = 0, maxRetries = 10) {
  console.log(
    `Retrying container add (attempt ${retryCount + 1}/${maxRetries})`
  );
  if (retryCount >= maxRetries) {
    console.error("Max retries reached - could not find chat container");
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  addListeningButton();
}

function updateListeningIcon(iconElement: HTMLElement) {
  console.log("Toggling listening: ", isListening);
  iconElement.innerHTML = isListening ? "🔊" : "🔇";
}

function addListeningButton() {
  const sendButton = document.querySelector(
    "button[aria-label='Search the web']"
  ) as HTMLButtonElement;
  const sendButtonContainer = sendButton?.parentElement?.parentElement;
  if (!sendButton || !sendButtonContainer) {
    console.log("No send button found");
    void retryListeningButtonAdd();
    return;
  }
  const newButton = sendButton.cloneNode(true) as HTMLElement;
  newButton.style.opacity = "1";
  newButton.removeAttribute("disabled");
  newButton.style.fontSize = "large";
  newButton.innerHTML = "";
  const newButtonText = document.createElement("p");
  updateListeningIcon(newButtonText);
  newButton.appendChild(newButtonText);
  newButton.addEventListener("click", async () => {
    const articles = document.querySelectorAll("article h6");
    const lastArticle = articles[articles.length - 1];
    if (!lastArticle?.parentElement?.querySelector("p")) {
      console.warn("Could not find last message content");
      return;
    }
    lastMessage = lastArticle.parentElement.querySelector("p")?.innerHTML || "";

    isListening = !isListening;
    const newMessage = await retrieveLastConversation();
    console.log("New message: ", newMessage);
    console.log("Last message: ", lastMessage);
    if (newMessage == lastMessage) {
      return;
    }
    lastMessage = newMessage;
    addNewChatFromGPT(newMessage);
    updateListeningIcon(newButtonText);
  });
  sendButtonContainer.parentElement?.appendChild(newButton);
}

async function addNewChatFromGPT(newText: string) {
  console.log("Adding new chat from GPT");
  const chatContainer = document.querySelector("article h6")?.parentElement;
  const chatContent = chatContainer?.querySelector(".markdown p");
  const conversationContainer = chatContainer?.parentElement;

  if (!chatContainer || !chatContent || !conversationContainer) {
    console.log("No chat container found");
    return;
  }
  console.log("Chat container found");

  const clonedChatContainer = chatContainer.cloneNode(true) as HTMLElement;
  const clonedChatContent = clonedChatContainer.querySelector(".markdown p");
  if (!clonedChatContent) {
    console.log("No chat content found");
    return;
  }
  const html = await convertMarkdownToHTML(newText, 0);

  console.log("HTML: ", html);
  (clonedChatContent as HTMLElement).innerHTML = html;
  conversationContainer.appendChild(clonedChatContainer);
}

function initializeContent() {
  console.log("Initializing content");
  init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeContent);
  console.log("Document loaded");
} else {
  initializeContent();
}
