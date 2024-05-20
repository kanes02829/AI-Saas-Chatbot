import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import EditMember from './EditMember';
import AddMember from './AddMember';
import { useToasts } from 'react-toast-notifications';
import messages from '../../const/message';

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

const Members = ({ store }) => {
  const [isAddMember, setIsAddMember] = useState(false);
  const [isEditMember, setIsEditMember] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [editableStatus, setEditableStatus] = useState(0); // 0: regardless, 1: MFA, 2: others
  const [role, setRole] = useState(0);
  const [dataSource, setDataSource] = useState([]); // 0: Owner, 1: Member, 2: Organizer
  const [query, setQuery] = useState([]);

  const toast = useToasts();

  const updateDataSource = async () => {
    let data = [];
    try {
      const res = await store.api.post('/settings/invitation/getCurrentInfo', {
        _id: store.currentOrgInfo._id,
        orgId: store.currentOrgInfo.currentOrgId,
      });

      if (res.data.code !== 200) {
        const toastId = toast.addToast(res.data.message, {
          appearance: 'error',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 3000); // Remove the toast after 3 seconds
      }

      // setUserInfo(res.data.userInfo[0]);
      // setInvitation(res.data.invitation);
      const userInfo = res.data.userInfo[0];
      const invitation = res.data.invitation;

      // console.log(userInfo, invitation);

      if (store.profile._id.localeCompare(userInfo._id) !== 0) {
        invitation.forEach((element) => {
          if (store.profile.email.localeCompare(element.email) === 0) {
            data.push({
              id: element._id, // invitation ID
              name: store.profile.fname + ' ' + store.profile.lname,
              role: element.permId,
              status: element.status,
              email: element.email,
              created: element.created,
              flag: 'me',
            });
          }
        });
      }

      let orgInvitationId = '';
      invitation.forEach((element) => {
        if (userInfo.email.localeCompare(element.email) === 0) {
          orgInvitationId = element._id;
        }
      });

      // console.log('orgInvitationId ', orgInvitationId);

      if (store.profile._id.localeCompare(userInfo._id) === 0) {
        data.push({
          id: orgInvitationId,
          name: store.profile.fname + ' ' + store.profile.lname,
          email: userInfo.email,
          role: 2,
          status: 1,
          created: userInfo.created,
          flag: 'me',
        });
      } else {
        data.push({
          id: orgInvitationId,
          name: userInfo.fname + ' ' + userInfo.lname,
          email: userInfo.email,
          role: 2,
          status: 1,
          created: userInfo.created,
          flag: 'other',
        });
      }

      invitation.forEach((element) => {
        if (
          userInfo.email.localeCompare(element.email) !== 0 &&
          store.profile.email.localeCompare(element.email) !== 0
        ) {
          data.push({
            id: element._id, // invitation ID
            name: '',
            email: element.email,
            role: element.permId,
            status: element.status,
            created: element.created,
            flag: 'other',
          });
        }
      });
      setDataSource(data);
    } catch (err) {}
  };

  const handleSearch = async (e) => {
    setQuery(e.target.value);
    console.log('search: ', e.target.value);
    const data = [];
    dataSource.forEach((element, index) => {
      if (
        element.name.includes(e.target.value) ||
        element.email.includes(e.target.value)
      ) {
        data.push(element);
      }
    });
    setDataSource(data);
  };

  useEffect(() => {
    updateDataSource();
    // const ks = async () => {
    //   console.log(
    //     await store.api.post('/settings/invitation/getCurrentInfo', {
    //       _id: store.currentOrgInfo._id,
    //       orgId: store.currentOrgInfo.currentOrgId,
    //     })
    //   );
    // };
    // ks();
  }, [isAddMember, isEditMember]);

  return (
    <div>
      {isAddMember === true ? (
        <AddMember store={store} setIsAddMember={setIsAddMember} />
      ) : (
        <></>
      )}
      {isEditMember === true ? (
        <EditMember
          store={store}
          setIsEditMember={setIsEditMember}
          currentId={activeId}
          editableStatus={editableStatus}
          role={role}
        />
      ) : (
        <></>
      )}
      <div className=" mt-6 py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex justify-between w-full space-x-2">
                <div className="relative flex items-center w-full flex-grow ">
                  <div className="focus-within:z-10 absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <input
                    required
                    id="name"
                    name="name"
                    autoComplete="off"
                    className=" pl-10 mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                    placeholder="Search..."
                    onChange={handleSearch}
                  ></input>
                </div>
                <button
                  className="bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
                  onClick={() => {
                    setIsAddMember(true);
                  }}
                >
                  <div className="flex space-x-2 px-2 py-2 items-center ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>{' '}
                    <span>New</span>
                  </div>
                </button>
              </div>
            </div>
            <div>
              <div>
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <div className="py-2 align-middle inline-block min-w-full">
                      <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                        <table
                          id="basic-table"
                          className="w-full border-collapse bg-white text-left text-sm text-gray-500"
                        >
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-4 font-medium text-gray-900"
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-4 font-medium text-gray-900"
                              >
                                Email
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-4 font-medium text-gray-900"
                              >
                                Role
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-4 font-medium text-gray-900"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-4 font-medium text-gray-900"
                              >
                                Created
                              </th>
                              {/* <th
                                scope="col"
                                className="px-6 py-4 font-medium text-gray-900"
                              >
                                Last login
                              </th> */}
                              <th
                                scope="col"
                                className="px-6 py-4 font-medium text-gray-900"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dataSource.map((record, index) => (
                              <tr key={index}>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                  {record.name}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                  {record.email}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                  <span className="text-xs w-28 justify-center inline-flex items-center px-1 py-1 rounded-sm font-medium bg-slate-50 text-gray-800 border border-slate-300">
                                    {record.role === 0
                                      ? 'Owner'
                                      : record.role === 1
                                      ? 'Member'
                                      : 'Organizer'}
                                  </span>
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                  {record.status === 0 ? 'pending' : 'joined'}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                                  {record.created}
                                </td>
                                <td className="w-20 px-2 py-2 whitespace-nowrap text-sm text-gray-600">
                                  {record.role !== 2 ? (
                                    <button
                                      onClick={() => {
                                        setActiveId(record.id);
                                        setIsEditMember(true);
                                        setEditableStatus(0);
                                        setRole(record.role);
                                      }}
                                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          ></path>
                                        </svg>
                                        <span>Edit</span>
                                      </div>
                                    </button>
                                  ) : (
                                    <>
                                      {record.flag === 'me' ? (
                                        <button
                                          onClick={() => {
                                            setActiveId(record.id);
                                            setIsEditMember(true);
                                            setEditableStatus(1);
                                            setRole(record.role);
                                          }}
                                          className="focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
                                        >
                                          <div className="flex items-center space-x-2">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                              ></path>
                                            </svg>
                                            <span>Edit</span>
                                          </div>
                                        </button>
                                      ) : (
                                        <div>Not allowed</div>
                                      )}
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(observer(inject('store')(Members)));
