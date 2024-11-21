# OpenAI Realtime Chat for ChatGPT Voice Mode

This extension enables you to view your ChatGPT Voice Mode calls within chatgpt.com in realtime.
This allows you to copy code and check what ChatGPT has recently said.

![](/assets/demo.png)

# Setup

1.  pnpm i

2.  pnpm run build

3.  (Within your browser) Window > Extensions

4.  Add the extension via load unpacked
    ![](/assets/tutorial_1.png)

5.  Navigate to v3 within this projects folder
    ![](/assets/tutorial_2.png)

6.  The new extension should now be added
    ![](/assets/tutorial_3.png)

7.  Navigate to ChatGPT.com: you will now see this
    ![](/assets/tutorial_4.png)

8.  Retrieve your ChatGPT auth cookie\*

    - View > Developer > Developer Tools > Network (tab) > Filter > conversations?offset=0 > Copy the authorization header (without Bearer)
      ![](/assets/tutorial_5.png)

9.  You will now see this button
    ![](/assets/tutorial_6.png)

    - When the speaker is on the extension will continue to monitor for any new chats made within the last minute

10. Start a Voice Mode call in ChatGPT Desktop or the mobile app

11. A seconds after the call has started: the chatgpt.com site will be redirected to the latest conversation

12. With the speaker still activated it will continue to retrieve any transcripts generations by Voice Mode

HOPE IT HELPS!

\*NOTE this is incredibly sus & shouldn't be taken lightly as this auth token can spoof your complete credentials to perform any account action so ensure the only thing the extension does is send the auth token to chatgpt.com
