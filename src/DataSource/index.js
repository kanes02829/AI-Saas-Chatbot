import React from 'react';
import { useRef, useState, useEffect } from 'react';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from '@material-tailwind/react';
import {
  DocumentTextIcon,
  GlobeAltIcon,
  PencilIcon,
} from '@heroicons/react/solid';
import { IconDots } from '@tabler/icons-react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';

import utilities from '../helpers/utilities';

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

const TabsWithIcon = ({ store }) => {
  const [url, setUrl] = useState('');
  const [linkList, setLinkList] = useState([
    // { id: 0, url: 'https://www.material-tailwind.com/' },
    // { id: 1, url: 'https://www.material-tailwind.com/' },
    // { id: 2, url: 'https://www.material-tailwind.com/' },
  ]);
  const [previousInputIndex, setPreviousInputindex] = useState(0);

  const [files, setFiles] = useState([]);
  const [botContent, setBotContent] = useState('');
  const [fileNum, setFileNum] = useState(0);
  const [fileChaNum, setFileChaNum] = useState(0);
  const [textChaNum, setTextChaNum] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const textareaRef = useRef(null);
  const inputRef = useRef([]);

  const toast = useToasts();

  const Files = () => {
    return (
      <>
        <div className="border border-gray-200 rounded mb-10">
          <div className="border-b border-gray-200 bg-white py-4 px-5">
            <h3 className="text-xl font-semibold leading-6 text-gray-900 ">
              Files
            </h3>
          </div>
          <div
            className="p-5 w-ful"
            onClick={() => {
              // const fileInput = document.querySelector('input[type="file"]');
              // fileInput.click();
              document.getElementById('fileSelect').click();
            }}
          >
            <div>
              <div
                role="presentation"
                tabindex="0"
                className="border border-neutral-200 p-16"
              >
                <input
                  accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                  multiple
                  type="file"
                  id="fileSelect"
                  tabindex="-1"
                  name="file"
                  className="hidden"
                  onChange={onChange}
                  disabled={creating || fetching}
                />
                <div className="flex flex-col items-center justify-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-5 w-5 fill-current"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <div className="text-center justify-center items-center">
                    <p className="text-sm text-gray-600 ">
                      Drag &amp; drop files here, or click to select files
                    </p>
                    <span
                      className="text-xs text-gray-500 dark:text-gray-300"
                      id="file_type_help"
                    >
                      Supported File Types: .pdf, .doc, .docx, .txt
                    </span>
                  </div>
                </div>
              </div>
              <p
                className="mt-2 text-sm text-center text-gray-500 dark:text-gray-300"
                id="file_input_help"
              >
                If you are uploading a PDF, make sure you can select/highlight
                the text.
              </p>
              <div className="pt-8"></div>
            </div>
          </div>
        </div>
        <div id="fileList" className="flex justify-center">
          {!files.length ? (
            <div className=" text-sm font-normal">{'No file is selected'}</div>
          ) : (
            <div>
              {Object.values(files).map((file, index) => (
                <div key={index} className=" flex flex-row pb-1">
                  <p
                    className="  text-sm w-72 font-normal"
                    disabled={creating || fetching}
                  >
                    {file.name}{' '}
                  </p>
                  <button
                    className=" mb-1"
                    onClick={() => deleteOneFile(index)}
                    type="text"
                    disabled={creating || fetching}
                  >
                    <i class=" text-sm fa-solid fa-trash-can w-4 h-4 text-red-600 ml-1" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className=" py-3 flex justify-center">
          {uploading && <IconDots size={36} className="animate-pulse" />}
        </div>
      </>
    );
  };

  const Text = () => {
    return (
      <>
        <div class="border border-gray-200 rounded mb-10">
          <div class="border-b border-gray-200 bg-white py-4 px-5">
            <h3 class="text-xl font-semibold leading-6 text-gray-900 ">Text</h3>
          </div>
          <div class="p-5">
            <div class="w-full">
              <textarea
                placeholder="Please input your prompt"
                name="data"
                rows="10"
                ref={textareaRef}
                value={botContent}
                onChange={handleTextChange}
                disabled={creating || fetching}
                class="my-2 min-w-0 p-1 flex-auto w-full appearance-none rounded-md border border-zinc-900/10 bg-white px-3 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 sm:text-sm text-gray-900"
              ></textarea>
              <p class="text-sm text-gray-600 text-center h-8">
                {textChaNum ? `${textChaNum}${'chars'}` : ''}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const Website = () => {
    return (
      <>
        <div className="border border-gray-200 rounded mb-10">
          <div className="border-b border-gray-200 bg-white py-4 px-5">
            <h3 className="text-xl font-semibold leading-6 text-gray-900">
              Website
            </h3>
          </div>
          <div className="p-5">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 my-2">
                Crawl
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                    }}
                    name="website"
                    className="flex-auto rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 sm:text-sm sm:leading-6"
                    placeholder="https://www.example.com"
                    disabled={creating || fetching}
                  />
                  <button
                    data-variant="flat"
                    className="bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
                    type="button"
                    onClick={handleFetch}
                    disabled={creating || fetching}
                  >
                    <div className="flex space-x-2 px-2 py-2 items-center ">
                      {/* <span>{fetching ? 'Fetch Loading' : 'Fetch Link'}</span> */}
                      {fetching ? (
                        <>
                          <svg
                            aria-hidden="true"
                            role="status"
                            class="inline mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            ></path>
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="#1C64F2"
                            ></path>
                          </svg>
                          <span>Fetch Loading...</span>
                        </>
                      ) : (
                        <span>Fetch Link</span>
                      )}
                    </div>
                  </button>
                </div>
                <div className="py-4 text-sm text-zinc-600">
                  This will crawl all the links starting with the URL (not
                  including files on the website).
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center my-4">
                <hr className="w-full border-gray-300 border-t" />
                <span className="px-2 text-gray-600 whitespace-nowrap">
                  Included Links
                </span>
                <hr className="w-full border-gray-300 border-t" />
              </div>
              <div className="flex justify-end">
                {linkList.length !== 0 ? (
                  <button
                    type="text"
                    onClick={deleteAll}
                    disabled={creating || fetching}
                    // className="bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center rounded-md border border-transparent py-1 px-2 text-sm font-medium text-black shadow-sm hover:bg-zinc-300"
                    className="rounded-md border border-red-500 text-red-500 py-1 px-2 text-sm font-medium hover:bg-red-50"
                  >
                    {'Delete All'}
                  </button>
                ) : (
                  <div />
                )}
              </div>
              {linkList.map((link, index) => (
                <div key={link.id} className="input-button">
                  <input
                    ref={(el) => (inputRef.current[index] = el)}
                    placeholder="https://www.example.com/privacy-policy"
                    value={link.url}
                    className=" w-3/4"
                    onChange={(event) =>
                      handleLinkLists(event, link, index, event.target)
                    }
                    disabled={creating || fetching}
                  />
                  <button
                    onClick={() => deleteOneLink(link.id)}
                    type="text"
                    disabled={creating || fetching}
                  >
                    <i class="fa-solid fa-trash-can w-4 h-4 text-red-600 ml-1" />
                  </button>
                </div>
              ))}
              <div className="my-2 flex justify-end">
                <button
                  type="button"
                  className="bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center rounded-md border border-transparent py-1 px-2 text-sm font-medium text-black shadow-sm hover:bg-zinc-300"
                  onClick={addLink}
                  disabled={creating || fetching}
                >
                  Add
                </button>
              </div>
            </div>
            <div
              aria-live="assertive"
              className="pointer-events-none fixed inset-0 flex items-end px-4 z-20 py-6 sm:items-start sm:p-6"
            >
              <div className="flex w-full flex-col items-center space-y-4 sm:items-end"></div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const data = [
    {
      label: 'Files',
      value: 'files',
      icon: DocumentTextIcon,
      desc: <Files />,
    },
    {
      label: 'Text',
      value: 'text',
      icon: PencilIcon,
      desc: <Text />,
    },
    {
      label: 'Website',
      value: 'website',
      icon: GlobeAltIcon,
      desc: <Website />,
    },
  ];

  useEffect(async () => {
    // getting previous files
  }, []);

  useEffect(() => {
    console.log(inputRef);
    const input = inputRef.current;

    const ref = input[previousInputIndex];
    console.log(ref);
    if (ref !== undefined && ref !== null) {
      ref.focus();
    }
  }, [linkList]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const caretPosition = botContent.length;

    textarea.focus();

    textarea.setSelectionRange(caretPosition, caretPosition);
  }, [botContent]);

  useEffect(() => {
    const newCharCounts = [];
    const preview = [];
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const content = event.target.result;
          newCharCounts.push(content.length);
          if (newCharCounts.length === files.length) {
            let characters = 0;
            let tempFiles = files;
            newCharCounts.map((count, index) => {
              tempFiles[index].characters = count;
              characters += count;
              return null;
            });
            setFiles(tempFiles);
            setFileNum(files.length);
            setFileChaNum(characters);
          }
        };
        reader.readAsText(files[i]);
      }
    } else {
      setFileNum(0);
      setFileChaNum(0);
    }

    if (preview.length) setUrl(URL.createObjectURL(preview[0]));
  }, [files]);

  const handleLinkLists = (event, link, index, target) => {
    const updatedLinkList = linkList.map((item) =>
      item.id === link.id ? { ...item, url: event.target.value } : item
    );
    setLinkList(updatedLinkList);
    console.log(index);
    setPreviousInputindex(index);
    // target.focus();
    // Focus on the input element
    // inputRef.current.focus();
  };

  const onChange = async () => {
    setUploading(true);
    const fileElement = document.getElementById('fileSelect');
    // console.log(fileElement.files);

    const newFiles = [...fileElement.files];

    console.log(newFiles);

    console.log(newFiles);
    Object.entries(newFiles).forEach(async ([, value]) => {
      console.log(value);
      const formData = new FormData();
      formData.append('file', value);
      formData.append('pathname', store.profile._id);
      formData.append('ownerId', store.currentOrgInfo._id);

      const chatbotFile = await store.api.post('/ai/chatbot/uploads', formData);

      console.log('chatbotFiles: ', chatbotFile.data.data);

      if (chatbotFile.data.code === 200) {
        // setFiles((prevFiles) => {
        //   const uniqueNewFiles = !prevFiles.some(
        //     (prev) => prev.origin === newBotFile.origin
        //   )
        //     ? [newBotFile]
        //     : [];
        //   console.log(uniqueNewFiles);
        //   return [...prevFiles, ...uniqueNewFiles];
        // });

        setFiles((prevFiles) => {
          const uniqueNewFiles = newFiles.filter(
            (file) => !prevFiles.some((prev) => prev.name === file.name)
          );
          return [...prevFiles, ...uniqueNewFiles];
        });
        setUploading(false);
      } else {
      }
    });
  };

  const handleTextChange = (e) => {
    setBotContent(e.target.value);
    setTextChaNum(e.target.value.length);
  };

  // window.addEventListener('error', (e) => {
  //   console.warn('resize: ', e);
  //   if (/resizeobserver/.test(e?.message || e || '').toString()) {
  //     console.log('xxxxxxxxxxxx');
  //     e.preventDefault();
  //     e.stopImmediatePropagation();
  //   }
  // });

  const handleFetch = async (event) => {
    event.preventDefault();
    setFetching(true);
    try {
      const url = document.getElementById('url').value;

      if (!url) {
        setFetching(false);
        return;
      }
      await store.api
        .post('/ai/chatbot/crawllinks', { URL: url })
        .then((res) => {
          console.log(res.data);
          let temp = [];
          console.log('res: ', res.data.data);
          res.data.data.forEach((link, index) => {
            if (link && utilities.isValidUrl(link)) {
              let current;
              console.log('links: ', link);
              if (linkList.length)
                current = linkList[linkList.length - 1].id + 1;
              else current = 1;
              temp.push({
                id: index + current,
                url: link,
              });
            }
          });
          console.log('temp: ', temp);
          setLinkList(temp);
          setFetching(false);
        });
    } catch (err) {
      console.log('error: ', err);
      setFetching(false);
    }
  };

  window.addEventListener('error', (e) => {
    console.log('window error');
    console.log(e);
  });

  const deleteAll = () => {
    setLinkList([]);
  };

  const deleteOneLink = async (id) => {
    console.log('xxxxxxxxxxxxxx: ', linkList);
    const updatedList = linkList.filter((link) => link.id !== id);
    setLinkList(updatedList);
  };

  const deleteOneFile = async (index) => {
    setUploading(true);
    try {
      const res = await store.api.post('/ai/chatbot/deletefile', {
        pathname: store.profile._id + '/' + files[index].name,
        ownerId: store.currentOrgInfo._id,
      });
      if (res.data.code === 200) {
        setFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          newFiles.splice(index, 1);
          return newFiles;
        });
        setUploading(false);
      } else {
        console.log('failed deleting file');
      }
    } catch (err) {}
  };

  const addLink = () => {
    const newLink =
      linkList.length > 0
        ? { id: linkList[linkList.length - 1].id + 1, url: '' }
        : { id: 0, url: '' };

    setLinkList(linkList.concat(newLink));
  };

  // check if email is valid
  const isValidAddedLink = () => {
    let isValid = true; // Initialize isValid variable outside the forEach loop

    Object.entries(linkList).forEach(([, value]) => {
      if (!isValid) {
        return; // Skip the iteration if isValid is already false
      }
      // if (value.url.length !== 0) {
      //   isValid = utilities.isValidUrl(value.url);
      //   if (!isValid) {
      //     isValid = false; // Set isValid to false if the URL is not valid
      //   }
      // }
    });
    return isValid; // Return the final value of isValid after the loop
  };

  const trainChatbot = async (event) => {
    event.preventDefault();
    setCreating(true);
    if (files.length || botContent.length || linkList.length) {
      if (!isValidAddedLink()) {
        setCreating(false);
        return;
      }
      try {
        let chatbotFiles = [];
        let chatbotContent = '';
        let chatbotLinks = [];
        if (files.length) {
          let cntChars = 0;
          // const formData = new FormData();
          // Object.entries(files).forEach(([, value]) => {
          //   console.log(value);
          //   formData.append('files', value);
          //   formData.append('characters', value.characters);

          //   cntChars += parseInt(value.characters);
          // });
          // console.log(cntChars);

          Object.entries(files).forEach(([, value]) => {
            chatbotFiles.push({
              origin: value.name,
              characters: value.characters,
            });
          });

          // if (
          //   cntChars > parseInt(process.env.REACT_APP_LIMITATION_CHARACTERS)
          // ) {
          //   setCreating(false);
          //   return;
          // }
          // chatbotFiles = await store.api.post('/ai/chatbot/uploads', formData);
          console.log('chatbotFiles: ', chatbotFiles);

          // if (chatbotFiles.data.code !== 200) {
          //   const toastId = toast.addToast(chatbotFiles.data.message, {
          //     appearance: 'error',
          //     autoDismiss: false,
          //   });
          //   setTimeout(() => {
          //     toast.removeToast(toastId);
          //   }, 3000); // Remove the toast after 3 seconds
          // }

          // console.log('formData: ', formData);
          // return;
        }

        // if (botFiles.length) chatbotFiles = botFiles;

        if (botContent.length) {
          chatbotContent = botContent;
        }

        if (linkList.length) chatbotLinks = linkList;
        console.log('chatbotFiles: ', chatbotFiles);
        console.log('chatbotContent: ', chatbotContent);
        console.log('chatbotLinks: ', chatbotLinks);

        const res = await store.api.post('/ai/chatbot/createchatbot', {
          files: chatbotFiles,
          content: chatbotContent,
          links: chatbotLinks,
        });

        console.log('result: ', res);

        if (res.data.code === 200) {
          const toastId = toast.addToast(res.data.message, {
            appearance: 'success',
            autoDismiss: false,
          });
          setTimeout(() => {
            toast.removeToast(toastId);
          }, 3000); // Remove the toast after 3 seconds
        }
        if (res.data.code !== 200) {
          const toastId = toast.addToast(res.data.message, {
            appearance: 'error',
            autoDismiss: false,
          });
          setTimeout(() => {
            toast.removeToast(toastId);
          }, 3000); // Remove the toast after 3 seconds
        }

        console.log(
          'createChatbot: ',
          chatbotFiles,
          chatbotContent,
          chatbotLinks
        );

        setCreating(false);
      } catch (err) {
        const toastId = toast.addToast('Internal Server Error!', {
          appearance: 'error',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 3000); // Remove the toast after 3 seconds
      }
    } else {
    }
    setCreating(false);
  };

  return (
    <div>
      <div className=" py-10 px-10">
        <div className="mb-8 ">
          <h1 className="text-3xl mb-2 text-center font-bold">Data Sources</h1>
          <p className=" text-center text-zinc-500">
            Add your data sources to train your chatbot
          </p>
        </div>
        <div className=" px-16">
          <Tabs value="files">
            <TabsHeader>
              {data.map(({ label, value, icon }) => (
                <Tab key={value} value={value}>
                  <div className="flex items-center gap-2">
                    {React.createElement(icon, { className: 'w-5 h-5' })}
                    {label}
                  </div>
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody>
              {data.map(({ value, desc }) => (
                <TabPanel key={value} value={value}>
                  {desc}
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
        </div>
        <div className="m-auto sm:w-4/6">
          <div className=" rounded border p-4">
            <p className="text-sm flex flex-col">
              {/* <span className="font-semibold">Total detected characters </span>
              <span className="flex justify-center">
                <span className="font-bold">0</span>{' '}
                <span className=" text-zinc-500">/400,000 limit</span>
              </span> */}

              {fileNum
                ? fileNum === 1
                  ? `${fileNum}${' file'} (${fileChaNum}${' char'})`
                  : `${fileNum}${' files'} (${fileChaNum}${' chars'})`
                : ''}
              {fileNum && textChaNum ? ' | ' : ''}
              {textChaNum
                ? textChaNum === 1
                  ? ` ${textChaNum}${' text input char'}`
                  : ` ${textChaNum}${' text input chars'}`
                : ''}
              {(fileNum || textChaNum) && linkList.length ? ' | ' : ''}
              {linkList.length
                ? linkList.length === 1
                  ? ` ${linkList.length}${' link'}`
                  : ` ${linkList.length}${' links'}`
                : ''}
            </p>
            <button
              data-variant="flat"
              className=" w-full mt-4 bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
              type="button"
              onClick={trainChatbot}
            >
              <div className="px-2 py-2 items-center ">
                {creating ? (
                  <>
                    <svg
                      aria-hidden="true"
                      role="status"
                      class="inline mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="#1C64F2"
                      ></path>
                    </svg>
                    <span>Train Loading...</span>
                  </>
                ) : (
                  <span>Train AI Assistant</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(observer(inject('store')(TabsWithIcon)));
