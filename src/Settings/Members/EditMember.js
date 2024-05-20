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

const EditMember = ({
  store,
  setIsEditMember,
  currentId,
  editableStatus,
  role,
}) => {
  // const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState(store.profile.email);
  const [permission, setPermission] = React.useState(role === 2 ? 0 : role);
  const toast = useToasts();

  const changePermission = async () => {
    // console.log('id: ', currentId);
    // console.log(permission);

    try {
      const res = await store.api.post(
        '/settings/invitation/changePermission',
        {
          userId: store.currentOrgInfo._id,
          invitationId: currentId,
          permId: permission,
        }
      );
      if (res.data.code === 200) {
        const toastId = toast.addToast(res.data.message, {
          appearance: 'success',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 3000); // Remove the toast after 3 seconds
      } else {
        const toastId = toast.addToast(res.data.message, {
          appearance: 'error',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 3000); // Remove the toast after 3 seconds
      }
    } catch (err) {
      const toastId = toast.addToast('Your action is failed!', {
        appearance: 'error',
        autoDismiss: false,
      });
      setTimeout(() => {
        toast.removeToast(toastId);
      }, 3000); // Remove the toast after 3 seconds
    }
    setIsEditMember(false);
  };
  const deleteInvitedUser = async () => {
    try {
      const res = await store.api.post(
        '/settings/invitation/deleteInvitedUser',
        {
          userId: store.currentOrgInfo._id,
          invitationId: currentId,
        }
      );
      if (res.data.code === 200) {
        const toastId = toast.addToast(res.data.message, {
          appearance: 'success',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 3000); // Remove the toast after 3 seconds
      } else {
        const toastId = toast.addToast(res.data.message, {
          appearance: 'error',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 3000); // Remove the toast after 3 seconds
      }
    } catch (err) {
      const toastId = toast.addToast('Your action is failed!', {
        appearance: 'error',
        autoDismiss: false,
      });
      setTimeout(() => {
        toast.removeToast(toastId);
      }, 3000); // Remove the toast after 3 seconds
    }
    setIsEditMember(false);
  };
  // const handleOpen = () => setOpen(!open);
  const handleOpen = () => setIsEditMember(false);

  return (
    <>
      {/* <Button onClick={handleOpen} variant="gradient">
        Open Dialog
      </Button> */}
      <Dialog open={true} handler={handleOpen}>
        <DialogHeader className=" py-3">Edit User</DialogHeader>
        <DialogBody divider>
          <div className="grid grid-cols-2 gap-3">
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
                        // defaultChecked
                        checked={permission === 0}
                        onChange={() => {
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
                        checked={permission === 1}
                        onChange={() => {
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
        </DialogBody>
        <DialogFooter>
          <div
            className={
              editableStatus === 1 ? '' : 'flex justify-between w-full'
            }
            style={{ backgroundColor: 'rgba(116, 16, 162, 0)' }}
          >
            {editableStatus === 1 ? (
              <></>
            ) : (
              <Button variant="text" color="red" onClick={deleteInvitedUser}>
                <span>Delete</span>
              </Button>
            )}
            <div style={{ backgroundColor: 'rgba(116, 16, 162, 0)' }}>
              <Button
                variant="text"
                color="blue"
                onClick={handleOpen}
                className="mr-1"
              >
                <span>Cancel</span>
              </Button>
              <Button
                variant="gradient"
                color="green"
                onClick={changePermission}
              >
                <span>Save</span>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default withRouter(observer(inject('store')(EditMember)));
