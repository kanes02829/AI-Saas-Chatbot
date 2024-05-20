import { useState, useEffect, memo } from 'react';
import utilities from '../helpers/utilities';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';
import { IconDots } from '@tabler/icons-react';

const withRouter = (Component) => (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Component
      {...props}
      location={location}
      navigate={navigate}
      params={params}
    />
  );
};

const Chatbot = ({ store }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! What can I help you with?',
      source: [
        {
          pageContent: 0,
          metadata: {
            pdf_numpages: 0,
            source: '',
          },
        },
      ],
    },
  ]);
  const [query, setQuery] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTyping && !isMobile() && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  };

  const sendQuery = async () => {
    try {
      let currentMessages = messages;
      // currentMessages = currentMessages.push({
      //   role: 'assistant',
      //   content: '',
      //   source: {
      //     pageContent: 0,
      //     metadata: {
      //       pdf_numpages: 0,
      //       source: '',
      //     },
      //   },
      // });
      // setMessages(currentMessages);
      let updatedMessage = {
        role: 'user',
        content: query,
        source: [
          {
            pageContent: 0,
            metadata: {
              pdf_numpages: 0,
              source: '',
            },
          },
        ],
      };
      currentMessages.push(updatedMessage);
      setMessages(currentMessages);
      console.log('messages: ', currentMessages);
      setQuery('');
      setWaiting(true);

      const response = await store.api.post(
        '/ai/chatbot/getreply',
        currentMessages
      );

      console.log('response: ', response.data);
      if (!response.data.success) {
        setWaiting(false);
        return;
      }

      const data = response.data;
      const result = await response.data;

      if (!data) {
        setWaiting(false);
        return;
      }

      // updatedMessage = {
      //   role: 'assistant',
      //   content: '',
      // };
      // setMessages([...messages, updatedMessage]);
      const allText = result.data;
      let i = 0;
      // console.log(allText);
      updatedMessage = {
        role: 'assistant',
        content: allText,
        source: result.source,
      };
      currentMessages.push(updatedMessage);
      setMessages(currentMessages);
      setWaiting(false);
      // const animKey = setInterval(() => {
      //   if (i === allText.length) {
      //     if (!utilities.isEmpty(result.source)) {
      //       let source = result.source;
      //       let saveContent = '';

      //       source.forEach((item, index) => {
      //         saveContent +=
      //           `Source ${index + 1}:\n\n` + item.pageContent + '\n\n';
      //       });

      //       updatedMessage = {
      //         role: 'source',
      //         content: saveContent,
      //       };
      //       currentMessages.push(updatedMessage);
      //       setMessages(currentMessages);
      //     }
      //     clearInterval(animKey);
      //     setWaiting(false);
      //     return;
      //   } else {
      //     updatedMessage = messages.map((message, index) => {
      //       if (index === messages.length - 1) {
      //         return {
      //           ...message,
      //           content: message.content + allText[i],
      //         };
      //       }

      //       return message;
      //     });
      //     console.log('adding Text ', updatedMessage);
      //     currentMessages.push(updatedMessage);
      //     setMessages(updatedMessage);
      //     i++;
      //   }
      // }, 5);
    } catch (err) {
      console.log(err);
      setWaiting(false);
    }
  };

  useEffect(() => {}, [messages]);

  const ChatLoader = () => {
    return (
      <div className="flex justify-start mr-8">
        <div className="mb-3 overflow-auto rounded-lg py-3 px-4 bg-gray-100 text-black">
          <div className="flex flex-col items-start gap-4 break-words">
            <div className="prose text-inherit text-left w-full break-words dark:prose-invert ">
              {/* <div className="flex">
                <div className="bg-blue-500 animate-spin"></div>
                <div className="bg-blue-500 animate-spin"></div>
                <div className="bg-blue-500 animate-spin"></div>
              </div> */}
              <IconDots className="animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChatMessage = () => {
    return (
      <div>
        {messages.map((element, index) => (
          <>
            {element.role !== 'user' ? (
              <div className="flex justify-start mr-8">
                <div className="mb-3 overflow-auto rounded-lg py-3 px-4 bg-gray-100 text-black">
                  <div className="flex flex-col items-start gap-4 break-words">
                    <div className="prose text-inherit text-left w-full break-words dark:prose-invert ">
                      <div>{element.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end ml-8">
                <div className="mb-3 overflow-auto rounded-lg py-3 px-4 bg-blue-500 text-white dark">
                  <div className="flex flex-col items-start gap-4 break-words">
                    <div className="prose text-inherit text-left w-full break-words dark:prose-invert ">
                      <div>{element.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ))}
        {waiting && <ChatLoader />}
      </div>
    );
  };
  return (
    <>
      <div className="max-w-5xl w-full m-auto py-4 px-4">
        <div className="my-12">
          <h1 className="text-3xl mb-2 text-center font-bold">My Chatbot</h1>
          <br />
          <p className=" text-center text-zinc-500">Use your trained chatbot</p>
        </div>
        <div className="rounded h-[42rem] bg-white border-zinc-200 border pt-2 px-2 overflow-hidden flex flex-col flex-auto flex-shrink-0">
          <div className="flex justify-between pb-2 mb-4 bg-white border-b w-full">
            <div className="flex items-center"></div>
            <button
              className="text-sm hover:text-zinc-600 text-zinc-700 "
              disabled={waiting}
              onClick={() => {
                setMessages([
                  {
                    role: 'assistant',
                    content: 'Hi! What can I help you with?',
                    source: [
                      {
                        pageContent: 0,
                        metadata: {
                          pdf_numpages: 0,
                          source: '',
                        },
                      },
                    ],
                  },
                ]);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div className="h-96 overflow-auto">
            <div className="react-scroll-to-bottom--css-weyyw-79elbk h-full">
              <div className="react-scroll-to-bottom--css-weyyw-1n7m0yu pr-2">
                <ChatMessage />
              </div>
            </div>
          </div>
          <div className="mb-4">
            {/* <div className="py-1">
                <div className="pb-1 text-gray-600 clear-both text-xs font-light">
                  27 message credits left
                </div>
              </div> */}
            <div
              className="flex pl-3 p-1 rounded"
              style={{
                background: 'white',
                border: '1px solid rgb(228, 228, 231)',
              }}
            >
              <input
                type="text"
                aria-label="chat input"
                required=""
                maxLength="2000"
                className="min-w-0 flex-auto appearance-none rounded-md bg-white focus:outline-none sm:text-sm text-gray-900"
                value={query}
                disabled={waiting}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsTyping(true)}
                onCompositionEnd={() => setIsTyping(false)}
              />
              <button
                type="button"
                className="flex-none p-2"
                disabled={waiting}
                onClick={sendQuery}
              >
                {waiting === true ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-red-700 opacity-60 dark:border-neutral-100"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withRouter(observer(inject('store')(Chatbot)));
