import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';
import messages from '../const/message';

// const withRouter = (Component) => (props) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const params = useParams();
//   const toastFuncs = useToasts();

//   return (
//     <Component
//       {...props}
//       location={location}
//       navigate={navigate}
//       params={params}
//       toast={toastFuncs}
//     />
//   );
// };

const Organization = ({ store }) => {
  const [orgName, setOrgName] = useState('');
  const toast = useToasts();

  const intialData = async () => {
    try {
      const res = await store.api.post(
        '/settings/organization/getCurrentOrgInfo',
        {
          _id: store.currentOrgInfo._id,
          orgId: store.currentOrgInfo.currentOrgId,
        }
      );
      if (res.data.code === 200) {
        setOrgName(res.data.data[0].orgName);
      } else {
        const toastId = toast.addToast(messages.failModification, {
          appearance: 'error',
          autoDismiss: false,
        });
        setTimeout(() => {
          toast.removeToast(toastId);
        }, 2000); // Remove the toast after 4 seconds
      }
    } catch (err) {
      console.log(err);
      const toastId = toast.addToast(messages.failModification, {
        appearance: 'error',
        autoDismiss: false,
      });
      setTimeout(() => {
        toast.removeToast(toastId);
      }, 2000); // Remove the toast after 4 seconds
    }
  };

  useEffect(() => {
    intialData();
  }, []);

  const handleChange = (e) => {
    setOrgName(e.target.value);
  };

  const handleSave = async () => {
    const res = await store.api.post('/settings/organization/updatename', {
      _id: store.currentOrgInfo._id,
      orgId: store.currentOrgInfo.currentOrgId,
      orgName: orgName,
    });
    if (res.data.code === 200) {
      const toastId = toast.addToast(messages.successModifiction, {
        appearance: 'success',
        autoDismiss: false,
      });

      setTimeout(() => {
        toast.removeToast(toastId);
      }, 2000); // Remove the toast after 4 seconds
    } else {
      const toastId = toast.addToast(messages.failModification, {
        appearance: 'error',
        autoDismiss: false,
      });
      setTimeout(() => {
        toast.removeToast(toastId);
      }, 2000); // Remove the toast after 4 seconds
    }
    console.log(res);
  };

  return (
    <div>
      <div className="py-4 space-y-2 mx-auto max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="md:grid lg:grid-cols-3 md:gap-2">
          <div className="md:col-span-1">
            <div className="sm:px-0">
              <h3 className="text-2xl font-medium leading-6 text-gray-900">
                General Settings
              </h3>
              <p className="text-base leading-5 text-gray-600 mt-3">
                Update your organization settings
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="shadow bg-white flex-1 rounded-xl transition hover:shadow-md overflow-hidden md:max-w-1lg text-gray-500 cursor-pointer border border-gray-300">
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="grid grid-cols-6 gap-2">
                  <div className="col-span-6 sm:col-span-6">
                    <label className="block text-sm font-medium leading-5 text-gray-700">
                      Name
                    </label>
                    <input
                      required
                      id="name"
                      name="name"
                      placeholder="John's Team"
                      autoComplete="off"
                      value={orgName}
                      onChange={handleChange}
                      className=" mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                    ></input>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 text-right sm:px-6">
                <button
                  onClick={handleSave}
                  className="bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-transparent shadow-sm text-sm font-medium rounded-md"
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
  );
};

// export default withRouter(observer(inject('store')(Organization)));

export default observer(inject('store')(Organization));
