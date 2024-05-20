/*eslint-disable*/
import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ store }) {
  const [collapseShow, setCollapseShow] = React.useState('hidden');
  const [isSettingExpanded, setIsSettingExpanded] = React.useState(false);

  return (
    <>
      <div class="dashboard-sidebar">
        {/* Collapse */}
        <div style={{ paddingTop: '20px', minWidth: '100% !important' }}>
          <h6 className="md:min-w-full text-blueGray-500 block pt-1 pb-4 no-underline">
            My Account
          </h6>
          {/* Navigation */}

          <ul className="md:flex-col md:min-w-full flex flex-col list-none">
            <li className="items-center">
              <Link
                className={
                  'py-3 block ' +
                  (window.location.href.indexOf('/') !== -1
                    ? 'text-lightBlue-500 hover:text-lightBlue-600'
                    : 'text-blueGray-700 hover:text-blueGray-500')
                }
                to="/"
              >
                <i
                  className={
                    'fas fa-tv mr-2 text-sm ' +
                    (window.location.href.indexOf('/') !== -1
                      ? 'opacity-75'
                      : 'text-blueGray-300')
                  }
                ></i>{' '}
                Dashboard
              </Link>
            </li>
            {/* <li className="items-center">
              <Link
                className={
                  'py-3 block ' +
                  (window.location.href.indexOf('/datasource') !== -1
                    ? 'text-lightBlue-500 hover:text-lightBlue-600'
                    : 'text-blueGray-700 hover:text-blueGray-500')
                }
                to="/"
              >
                <i
                  className={
                    'fa-solid fa-database mr-2 text-sm ' +
                    (window.location.href.indexOf('/datasource') !== -1
                      ? 'opacity-75'
                      : 'text-blueGray-300')
                  }
                ></i>{' '}
                Data Sources
              </Link>
            </li> */}
            <li className="items-center">
              <Link
                className={
                  'py-3 block ' +
                  (window.location.href.indexOf('/datasource') !== -1
                    ? 'text-lightBlue-500 hover:text-lightBlue-600'
                    : 'text-blueGray-700 hover:text-blueGray-500')
                }
                to="/datasource"
              >
                <i
                  className={
                    'fas fa-solid fa-database mr-2 text-sm ' +
                    (window.location.href.indexOf('/datasource') !== -1
                      ? 'opacity-75'
                      : 'text-blueGray-300')
                  }
                ></i>{' '}
                Data Sources
              </Link>
            </li>
            <li className="items-center">
              <Link
                className={
                  'py-3 block ' +
                  (window.location.href.indexOf('/chatbot') !== -1
                    ? 'text-lightBlue-500 hover:text-lightBlue-600'
                    : 'text-blueGray-700 hover:text-blueGray-500')
                }
                to="/chatbot"
              >
                <i
                  className={
                    'fa-solid fa-robot mr-2 text-sm ' +
                    (window.location.href.indexOf('/chatbot') !== -1
                      ? 'opacity-75'
                      : 'text-blueGray-300')
                  }
                ></i>{' '}
                My Chatbot
              </Link>
            </li>
            <li className="items-center">
              <Link
                className={
                  'py-3 block ' +
                  (window.location.href.indexOf('/admin/settings') !== -1
                    ? 'text-lightBlue-500 hover:text-lightBlue-600'
                    : 'text-blueGray-700 hover:text-blueGray-500')
                }
                to="/document"
              >
                <i
                  className={
                    'fas fa-file-alt mr-2 text-sm ' +
                    (window.location.href.indexOf('/admin/settings') !== -1
                      ? 'opacity-75'
                      : 'text-blueGray-300')
                  }
                ></i>{' '}
                MyDocuments
              </Link>
            </li>
          </ul>

          {/* Divider */}
          <hr className="my-4 md:min-w-full" />
          {/* Heading */}
          <h6 className="md:min-w-full text-blueGray-500 block pt-1 pb-4 no-underline">
            Organize and Manage
          </h6>
          {/* Navigation */}

          <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
            <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500  py-3 block"
                to="/"
              >
                <i className="fas fa-synagogue text-blueGray-400 mr-2 text-sm"></i>{' '}
                Templates
              </Link>
            </li>

            <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500 py-3 block"
                to="/auth/register"
              >
                <i className="fas fa-images text-blueGray-300 mr-2 text-sm"></i>{' '}
                AI Images
              </Link>
            </li>
            <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500  py-3 block"
                to="/auth/register"
              >
                <i className="fas fa-comments text-blueGray-300 mr-2 text-sm"></i>{' '}
                AI Chat
              </Link>
            </li>
            {/* <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500 py-3 block"
                to="/auth/register"
              >
                <i className="fas fa-headphones text-blueGray-300 mr-2 text-sm"></i>{' '}
                Speech to Text
              </Link>
            </li> */}
            {/* <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500 py-3 block"
                to="/auth/register"
              >
                <i className="fas fa-code text-blueGray-300 mr-2 text-sm"></i>{' '}
                AI Code
              </Link>
            </li> */}
          </ul>

          {/* Divider */}
          <hr className="my-4 md:min-w-full" />
          {/* Heading */}
          <h6 className="md:min-w-full text-blueGray-500 block pt-1 pb-4 no-underline">
            Account
          </h6>
          {/* Navigation */}

          <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
            <li className="items-center">
              <div>
                <button
                  className="text-blueGray-700 hover:text-blueGray-500 py-3 block "
                  onClick={() => {
                    setIsSettingExpanded(!isSettingExpanded);
                  }}
                >
                  <i className=" ml-8 fas fa-user-cog text-blueGray-300 mr-2 text-sm"></i>{' '}
                  Account Setting{' '}
                  <i class="fa-sharp fa-solid fa-arrow-down text-blueGray-300 mr-2 text-sm ml-14"></i>
                </button>
              </div>
              {isSettingExpanded === true ? (
                <>
                  <div>
                    <Link
                      className="text-blueGray-700 hover:text-blueGray-500 py-3 block "
                      to="/settings/profile"
                    >
                      <i className=" fas fa-user-cog text-blueGray-300 mr-2 text-sm"></i>{' '}
                      Profile
                    </Link>
                  </div>
                  <div>
                    <Link
                      className="text-blueGray-700 hover:text-blueGray-500 py-3 block "
                      to="/settings/members"
                    >
                      <i className=" fas fa-user-cog text-blueGray-300 mr-2 text-sm"></i>{' '}
                      Members
                    </Link>
                  </div>
                  <div>
                    <Link
                      className="text-blueGray-700 hover:text-blueGray-500 py-3 block "
                      to="/settings/subscription"
                    >
                      <i className=" fas fa-user-cog text-blueGray-300 mr-2 text-sm"></i>{' '}
                      Subscription
                    </Link>
                  </div>
                  <div>
                    <Link
                      className="text-blueGray-700 hover:text-blueGray-500 py-3 block "
                      to="/settings/organization"
                    >
                      <i className=" fas fa-user-cog text-blueGray-300 mr-2 text-sm"></i>{' '}
                      Organization
                    </Link>
                  </div>
                </>
              ) : (
                <></>
              )}
            </li>
            <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500 py-3 block"
                to="/landing"
              >
                <i className="fas fa-affiliatetheme text-blueGray-400 mr-2 text-sm"></i>{' '}
                Affiliate Program
              </Link>
            </li>

            <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500 py-3 block"
                to="/profile"
              >
                <i className="fas fa-gift text-blueGray-400 mr-2 text-sm"></i>{' '}
                Membership
              </Link>
            </li>
            <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500  py-3 block"
                to="/auth/register"
              >
                <i className="fas fa-coins text-blueGray-300 mr-2 text-sm"></i>{' '}
                Transactions
              </Link>
            </li>

            <li className="items-center">
              <Link
                className="text-blueGray-700 hover:text-blueGray-500 py-3 block"
                to="/"
                onClick={store.handleLogout}
              >
                <i className="fas fa-sign-out text-blueGray-300 mr-2 text-sm"></i>{' '}
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
