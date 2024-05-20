import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
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

const Profile = ({ store }) => {
  const [email, setEmail] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRePass, setNewRePass] = useState('');
  const [isDelete, setIsDelete] = useState(false);
  // const toast = useToast();

  useEffect(() => {
    setEmail(store.profile.email);
    setFname(store.profile.fname);
    setLname(store.profile.lname);
  }, []);

  const handleProfileSave = () => {
    try {
      const res = store.api.post('/settings/profile/setprofile', {
        email: email,
        fname: fname,
        lname: lname,
      });

    } catch (err) {
      console.log(err);
    }
  };

  const handlePasswordSave = () => {
    try {
      const res = store.api.post('/settings/setsecurity', {
        currentPass: currentPass,
        newPass: newPass,
        newRePass: newRePass,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const ConfirmDialog = () => {
    const handleDelete = async () => {
      setIsDelete(false);
    };

    return (
      <Dialog open={true} handler={isDelete}>
        <DialogBody className=" py-3 text-lg font-semibold text-red-500">
          <div>Do you want to delete this one?</div>
          <div>
            Once you delete your account, you will lose all data associated with
            it.
          </div>
        </DialogBody>
        <DialogFooter divider>
          <div className=" mt-3 flex justify-end text-blue-gray-500">
            <button
              class="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg text-red-500 hover:bg-red-500/10 active:bg-red-500/30 mr-1"
              type="button"
              onClick={() => setIsDelete(false)}
            >
              <span>Cancel</span>
            </button>
            <button
              className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/40 active:opacity-[0.85]"
              onClick={handleDelete}
            >
              <span>Delete</span>
            </button>
          </div>
        </DialogFooter>
      </Dialog>
    );
  };
  return (
    <>
      <div className=" mt-14 py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <div className="md:grid lg:grid-cols-3 md:gap-2">
            <div className="md:col-span-1">
              <div className="sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Profile
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Change your user profile
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="shadow overflow-hidden sm:rounded-sm">
                <div className="px-4 py-5 bg-white sm:p-6">
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-6 sm:col-span-6 md:col-span-6">
                      <label
                        for="email_address"
                        className="block text-sm font-medium leading-5 text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        disabled={true}
                        type="email"
                        id="email-address"
                        name="email"
                        className="bg-gray-100 mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <label
                        for="firstName"
                        className="block text-sm font-medium leading-5 text-gray-700"
                      >
                        First name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        aria-invalid="false"
                        className="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <label
                        for="lastName"
                        className="block text-sm font-medium leading-5 text-gray-700"
                      >
                        Last name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        aria-invalid="false"
                        className="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <div className="flex justify-between">
                    <div
                      id="form-success-message"
                      className="flex space-x-2 items-center"
                    ></div>
                    <button
                      type="submit"
                      // className="inline-flex space-x-2 items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                      className=" bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
                      onClick={handleProfileSave}
                    >
                      <div className="flex space-x-2 px-2 py-2 items-center ">
                        <i class="fas fa-save"></i>
                        <span>Save</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="block">
            <div class="py-5">
              <div class="border-t border-gray-200"></div>
            </div>
          </div>
          <div class="md:grid lg:grid-cols-3 md:gap-2">
            <div class="md:col-span-1">
              <div class="sm:px-0">
                <h3 class="text-lg font-medium leading-6 text-gray-900">
                  Security
                </h3>
                <p class="mt-1 text-xs leading-5 text-gray-600">
                  Reset password
                </p>
              </div>
            </div>
            <div class="mt-5 md:mt-0 md:col-span-2">
              <div class="shadow overflow-hidden sm:rounded-sm">
                <div>
                  <div class="px-4 py-5 bg-white sm:p-6">
                    <div class="grid grid-cols-6 gap-2">
                      <div class="col-span-6 sm:col-span-6">
                        <label
                          for="passwordCurrent"
                          class="block text-sm font-medium leading-5 text-gray-700"
                        >
                          Current password
                        </label>
                        <input
                          required=""
                          type="password"
                          id="passwordCurrent"
                          name="passwordCurrent"
                          class="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                        />
                      </div>
                      <div class="col-span-6 md:col-span-3">
                        <label
                          for="password"
                          class="block text-sm font-medium leading-5 text-gray-700"
                        >
                          Password
                        </label>
                        <input
                          required=""
                          type="password"
                          id="passwordNew"
                          name="passwordNew"
                          class="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                        />
                      </div>
                      <div class="col-span-6 md:col-span-3">
                        <label
                          for="passwordConfirm"
                          class="block text-sm font-medium leading-5 text-gray-700"
                        >
                          Confirm password
                        </label>
                        <input
                          required=""
                          type="password"
                          id="passwordNewConfirm"
                          name="passwordNewConfirm"
                          class="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                          value={newRePass}
                          onChange={(e) => setNewRePass(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <div class="flex space-x-2 justify-between">
                      <div
                        id="form-success-message"
                        class="flex space-x-2 items-center"
                      ></div>
                      <button
                        type="submit"
                        // class="inline-flex space-x-2 items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500"
                        className="bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
                        onClick={handlePasswordSave}
                      >
                        <div className="flex space-x-2 px-2 py-2 items-center ">
                          <i class="fas fa-save"></i>
                          <span>Save</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="block">
            <div class="py-5">
              <div class="border-t border-gray-200"></div>
            </div>
          </div>
          <div class="md:grid lg:grid-cols-3 md:gap-2">
            <div class="md:col-span-1">
              <div class="sm:px-0">
                <h3 class="text-lg font-medium leading-6 text-gray-900">
                  Danger zone
                </h3>
                <p class="mt-1 text-xs leading-5 text-gray-600">Be careful</p>
              </div>
            </div>
            <div class="mt-12 md:mt-0 md:col-span-2">
              <div>
                <div class="bg-white shadow sm:rounded-sm">
                  <div class="px-4 py-5 sm:p-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                      Delete your account
                    </h3>
                    <div class="mt-2 max-w-xl text-sm leading-5 text-gray-500">
                      <p>
                        Once you delete your account, you will lose all data
                        associated with it.
                      </p>
                    </div>
                    <div class="mt-5">
                      <span>
                        <button
                          type="button"
                          class="text-white inline-flex space-x-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md  focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-500 hover:bg-red-600 focus:ring-red-400"
                          onClick={() => setIsDelete(true)}
                        >
                          Delete account
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isDelete === true ? <ConfirmDialog /> : <></>}
    </>
  );
};

export default withRouter(observer(inject('store')(Profile)));
