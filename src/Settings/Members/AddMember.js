import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react';
import { useToasts } from 'react-toast-notifications';

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
const AddMember = ({ store, setIsAddMember }) => {
  // const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [permission, setPermission] = React.useState(0);
  const toast = useToasts();

  const inviteUser = async () => {
    try {
      const data = {
        orgId: store.currentOrgInfo.currentOrgId, // current organization ID
        orgName: store.currentOrgInfo.currentOrgName, // current organization Name
        orgUserId: store.currentOrgInfo._id, // current organization user ID
        userId: store.profile._id, // who invited?
        email: email, // destination email
        permId: permission, // owner or member
        status: 0,
        url: 'http://localhost:8082/invite/',
      };
      const res = await store.api.post('/settings/invitation/inviteuser', data);
      console.log('res: ', res);
      if (res.data.code === 200) {
        const toastId = toast.addToast(res.data.message, {
          appearance: 'success',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 3000); // Remove the toast after 4 seconds
      } else {
        const toastId = toast.addToast(res.data.message, {
          appearance: 'error',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 3000); // Remove the toast after 4 seconds
      }
      handleOpen();
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpen = () => setIsAddMember(false);
  // const handleOpen = () => setIsEditMember(!open);

  return (
    <>
      {/* <Button onClick={handleOpen} variant="gradient">
        Open Dialog
      </Button> */}

      <Dialog open={true} handler={handleOpen}>
        <DialogHeader className=" py-3">Add User</DialogHeader>
        <DialogBody divider>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 ">
              <label
                for="email"
                className="block text-sm font-medium text-gray-700 truncate "
              >
                Email
              </label>
              <div className="mt-1 flex rounded-md shadow-sm w-full">
                <input
                  type="email"
                  name="email"
                  autocomplete="off"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label
                for="last-name"
                className="block text-sm font-medium text-gray-700 truncate"
              >
                Role
              </label>
              <div className="mt-1 rounded-md shadow-sm w-full">
                <fieldset>
                  <legend className="sr-only">Role</legend>
                  <div className="bg-white rounded-md -space-y-px">
                    <label className="relative border py-2 px-4 flex cursor-pointer focus:outline-none border-gray-200">
                      <input
                        type="radio"
                        name="tenant-user-role"
                        autoComplete="off"
                        className="h-4 w-4 mt-3 cursor-pointer text-theme-600 border-gray-300 focus:ring-theme-500"
                        aria-labelledby="tenant-user-role-0-label"
                        aria-describedby="tenant-user-role-0-description"
                        defaultChecked
                        onChange={() => {
                          console.log(permission);
                          setPermission(0);
                        }}
                      />
                      <div className="ml-3 flex flex-col">
                        <span
                          id="tenant-user-role-0-label"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Owner
                        </span>
                        <span
                          id="tenant-user-role-0-description"
                          className="block text-sm text-gray-500"
                        >
                          Manages subscription and users
                        </span>
                      </div>
                    </label>
                    <label className="relative border py-2 px-4 flex cursor-pointer focus:outline-none bg-theme-50 border-theme-200 z-10">
                      <input
                        type="radio"
                        name="tenant-user-role"
                        autoComplete="off"
                        className="h-4 w-4 mt-3 cursor-pointer text-theme-600 border-gray-300 focus:ring-theme-500"
                        aria-labelledby="tenant-user-role-0-label"
                        aria-describedby="tenant-user-role-0-description"
                        onChange={() => {
                          console.log(permission);
                          setPermission(1);
                        }}
                      />
                      <div className="ml-3 flex flex-col">
                        <span
                          id="tenant-user-role-0-label"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Member
                        </span>
                        <span
                          id="tenant-user-role-0-description"
                          className="block text-sm text-gray-500"
                        >
                          Creates and signs contracts
                        </span>
                      </div>
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
          <div className=" mt-3 flex justify-end text-blue-gray-500">
            <button
              class="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg text-red-500 hover:bg-red-500/10 active:bg-red-500/30 mr-1"
              type="button"
              onClick={handleOpen}
            >
              <span>Cancel</span>
            </button>
            <button
              className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/40 active:opacity-[0.85]"
              onClick={inviteUser}
            >
              <span>Invite</span>
            </button>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
};

export default withRouter(observer(inject('store')(AddMember)));
