import React, { Component, useState } from 'react';
import { observer, inject } from 'mobx-react';
import { NavLink } from 'react-router-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

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

@inject('store')
@observer
class HeaderComponent extends Component {
  componentDidMount() {
    window.addEventListener('click', this.capture_click);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.capture_click);
  }

  capture_click = (event) => {
    const pop = document.getElementById('pop');
    if (!pop.contains(event.target)) {
      this.setState((prevState) => ({
        showpopmenu: false,
      }));
    }
  };

  state = {
    showpopmenu: false,
  };

  handlepopupmenuChange = () => {
    this.setState((prevState) => ({
      showpopmenu: !prevState.showpopmenu,
    }));
  };

  changeSidebarClick = () => {
    this.props.onShowSidebarChange();
  };

  go_full_screen = () => {
    let elem = document.documentElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  render() {
    return (
      <>
        <div
          className="border-gray-300 bg-white flex"
          style={{ height: '82px' }}
        >
          <div
            className="md:left-0 md:top-0 md:fixed container flex select-none justify-between bg-white "
            style={{
              zIndex: '999',
              maxWidth: '100%',
              boxShadow: '0 0 18px 0 rgba(0, 0, 0, .12)',
              position: 'fixed',
            }}
          >
            <div className="flex items-center">
              <div id="logo">
                <img src="/logo/128867375.png" alt="AI to Social" />
              </div>
              <div
                className="mx-6"
                style={{
                  display: 'inline-block',
                  height: '35px',
                  width: '35px',
                  background: 'rgba(116,16,162,0.2)',
                  textAlign: 'center',
                  lineHeight: '35px',
                  borderRadius: '50%',
                  fontSize: '14px',
                  color: 'rgba(116,16,162,1)',
                  marginRight: '0px',
                  cursor: 'pointer',
                }}
                onClick={this.changeSidebarClick}
              >
                <i className="fa fa-bars"></i>
              </div>
              <div
                className="mx-6"
                style={{
                  display: 'inline-block',
                  height: '35px',
                  width: '35px',
                  background: 'rgba(116,16,162,0.2)',
                  textAlign: 'center',
                  lineHeight: '35px',
                  borderRadius: '50%',
                  fontSize: '14px',
                  color: 'rgba(116,16,162,1)',
                  marginLeft: '10px',
                  cursor: 'pointer',
                }}
                onClick={() => this.go_full_screen()}
              >
                <i className="fas fa-expand"></i>
              </div>
            </div>
            <div className="relative text-gray-400 focus-within:text-green-500 flex flex-1 ">
              <label
                htmlFor="q"
                className="absolute inset-y-0 left-0 top-0 bottom-0 hidden md:flex items-center lg:pl-2 "
              >
                <div
                  type="submit"
                  className="p-2 focus:outline-none focus:shadow-outline "
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 transition"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </label>
              <input
                type="search"
                tabIndex={-1}
                id="q"
                name="q"
                className="py-4 pl-4 md:pl-14 text-xl focus:outline-none focus:bg-white focus:text-gray-900 transition flex flex-1 w-full"
                placeholder="Search...  [Shortcut: Ctrl + K]"
                autoComplete="off"
                value={this.props.store.toolsKeyword}
                onChange={this.props.store.onChangeToolsKeyword}
                onKeyUp={this.onKeyUp}
              />
            </div>
            <div
              className="flex items-center"
              style={{
                borderLeftWidth: '1px',
                borderRightWidth: '1px',
                paddingLeft: '25px',
                paddingRight: '25px',
              }}
            >
              <div
                id="pop"
                style={{
                  display: 'inline-block',
                  height: '35px',
                  width: '35px',
                  background: 'rgba(116,16,162,0.2)',
                  textAlign: 'center',
                  lineHeight: '35px',
                  borderRadius: '50%',
                  fontSize: '14px',
                  color: 'rgba(116,16,162,1)',
                  cursor: 'pointer',
                }}
                onClick={this.handlepopupmenuChange}
              >
                <i className="fas fa-user"></i>
              </div>
            </div>
            {this.state.showpopmenu && Popmenu(this.props)}
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(HeaderComponent);

const Popmenu = (props) => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          right: '35px',
          top: '70px',
          height: '30',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid #d7d7d7',
        }}
      ></div>
      <div
        className="absolute right-5 top-20"
        style={{
          padding: '5px',
          borderRadius: '4px',
          background: 'white',
          boxShadow: '0 2px 5px 0 rgba(0, 0, 0, .12)',
        }}
      >
        <ul style={{ listStyle: 'none', padding: '5px' }} className="popmenu">
          <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className={
                'text-xs uppercase py-3 font-bold block text-lightGreen-500 hover:text-lightBlue-600'
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
          <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
              to="/"
            >
              <i className="fas fa-synagogue text-blueGray-400 mr-2 text-sm"></i>{' '}
              Templates
            </Link>
          </li>
          <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
              to="/auth/register"
            >
              <i className="fas fa-images text-blueGray-300 mr-2 text-sm"></i>{' '}
              AI Images
            </Link>
          </li>
          <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
              to="/auth/register"
            >
              <i className="fas fa-comments text-blueGray-300 mr-2 text-sm"></i>{' '}
              AI Chat
            </Link>
          </li>
          {/* <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
              to="/auth/register"
            >
              <i className="fas fa-headphones text-blueGray-300 mr-2 text-sm"></i>{' '}
              Speech to Text
            </Link>
          </li> */}
          {/* <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
              to="/auth/register"
            >
              <i className="fas fa-code text-blueGray-300 mr-2 text-sm"></i> AI
              Code
            </Link>
          </li> */}
          <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className={
                'text-xs uppercase py-3 font-bold block text-lightBlue-500 hover:text-lightBlue-600'
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
              All Documents
            </Link>
          </li>
          <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
              to="/profile"
            >
              <i className="fas fa-gift text-blueGray-400 mr-2 text-sm"></i>{' '}
              Membership
            </Link>
          </li>
          <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
              to="/auth/register"
            >
              <i className="fas fa-user-cog text-blueGray-300 mr-2 text-sm"></i>{' '}
              Account Setting
            </Link>
          </li>
          <li
            style={{
              padding: '0px 20px',
              width: '180px',
              textAlign: 'left',
              background: 'white',
            }}
          >
            <Link
              className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
              to="/"
              onClick={props.store.handleLogout}
            >
              <i className="fas fa-sign-out text-blueGray-300 mr-2 text-sm"></i>{' '}
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};
