# WhatsAppDoc

WhatsApp Doc is a simple application to recover deleted passwords via WhatsApp Web.

![Example](https://www.andrewmohawk.com/wp-content/uploads/2018/12/WhatsAppDoc.gif "Example")

# Installation
Either install directly with the CRX file or you can simply load the unpacked extension from the cloned directory

# Caveats
## Different types of messages
I only built this to capture text messages, not images/video/audio/files but its possible to monitor for those as well. To do this one would need to go and pull the linked data (such as a voice note or image file), store it somewhere and then if deleted return it to the client with a link to the original. Its hacky and messy and I think that if someone deletes an image its probably okay. On the other hand all these types do give you a thumbnail that you can use and is returned as a Base64 encoded image, which you can decode even simply online with something like http://freeonlinetools24.com/base64-image

## Messages arent instantly shown after deleted
Because of the way the application works and my laziness you will need to hover over the deleted message, check the console or tab out and tab back into WhatsApp web to get it to show the deleted message. 

## Leaving WhatsApp web open for a long time without the tab in focus can break things
The message store will refresh when you bring the tab back in focus and cause an inconsistency between the DiffStore as well as the original WhatsApp message store, you will need to simply reload the page to keep them balanced

## Its coded badly
Yeah, I got nothing for you, you are welcome to make PRs or just redo it yourself :) This was just me mucking around to figure out how it worked and I would in no way encourage anyone to code like I do!

-AM
