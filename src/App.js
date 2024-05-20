import { ThemeProvider } from 'styled-components';
import React, { Component } from 'react';

import { Provider } from 'mobx-react';
import { observer } from 'mobx-react';

import AppStore from './store';
import colors from 'tailwindcss/colors';
import '@fortawesome/fontawesome-free/css/all.css';

import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
} from 'react-router-dom';

import Header from './Header';
import Search from './Search';
import Pricing from './Pricing'; // <--- Add this line
import Referral from './Profile/Referral';
import Feedback from './Profile/Feedback';
import Sidebar from './Components/Sidebar/Sidebar';
import Organization from './Settings/Organization';
import Members from './Settings/Members/Members';
import DataSource from './DataSource/index';
import Chatbot from './Chatbot/index';
import Profile from './Settings/Profile';

// import HeaderStats from './Components/Headers/HeaderStats';

import Dashboard from './Dashboard';

import Tool from './Core/Tool';
import Chat from './Core/Chat';

import Login from './Login/Login';

import Body from './Profile/index';
import LoginSuccess from './Login/Success';

import MyDocument from './Document/index';

import './App.scss';

if (!window.store) {
  window.store = new AppStore();
}

@observer
class App extends Component {
  state = {
    showSidebar: true,
  };
  handleShowSidebarChange = () => {
    this.setState((prevState) => ({
      showSidebar: !prevState.showSidebar,
    }));
  };
  componentWillMount = () => {
    console.log('apps: ', window.store.profile);
  };
  render() {
    return (
      <ThemeProvider theme={colors}>
        <Provider store={window.store}>
          <Router>
            {window.store.redirect ? (
              <Navigate to={window.store.redirect} />
            ) : null}
            {window.store.isLoggedIn ? (
              <>
                <Header onShowSidebarChange={this.handleShowSidebarChange} />
                <div
                  className="bg-blueGray-100 flex justify-between"
                  style={{ display: 'flex' }}
                >
                  {this.state.showSidebar && <Sidebar store={window.store} />}
                  <div
                    style={{
                      flex: '1',
                      overflowY: 'scroll',
                      background: 'white',
                      height: 'calc(100vh - 82px)',
                    }}
                  >
                    <Routes>
                      <Route
                        path="/login"
                        exact
                        element={<Navigate to="/" />}
                      />
                      <Route path="/" exact element={<Dashboard />} />
                      <Route path="/search" exact element={<Search />} />
                      <Route path="/ai/">
                        <Route path="/ai/blog/">
                          <Route
                            path="/ai/blog/blog_ideas"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/blog_intros"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/blog_titles"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/blog_section"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/blog_conclusion"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/article_writer"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/article_writer"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/article_outlines"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/talking_points"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/paragraph_writer"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/blog/content_rephrase"
                            element={<Tool />}
                          />
                        </Route>
                        <Route path="/ai/ads/">
                          <Route
                            path="/ai/ads/facebook_ads"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/ads/facebook_ads_headlines"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/ads/google_ad_titles"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/ads/google_ad_descriptions"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/ads/linkedin_ad_headlines"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/ads/linkedin_ad_descriptions"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/ads/app_sms_notifications"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/ads/sales_email_generator"
                            element={<Tool />}
                          />
                        </Route>
                        <Route path="/ai/social/">
                          <Route
                            path="/ai/social/social_media_post_personal"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/social_media_post_business"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/instagram_captions"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/instagram_hashtags"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/twitter_tweets"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/youtube_titles"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/youtube_descriptions"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/youtube_outlines"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/linkedin_posts"
                            element={<Tool />}
                          />
                          <Route
                            path="/ai/social/tiktok_video_scripts"
                            element={<Tool />}
                          />
                        </Route>
                      </Route>
                      <Route path="/my-profile" element={<Body />} />
                      <Route
                        exact
                        path="/my-profile/pricing"
                        element={<Pricing />}
                      />
                      <Route
                        exact
                        path="/my-profile/referral"
                        element={<Referral />}
                      />
                      <Route
                        exact
                        path="/my-profile/feedback"
                        element={<Feedback />}
                      />

                      <Route path="/signup/failed" element={<Body />} />
                      <Route
                        path="/signup/success"
                        element={<LoginSuccess />}
                      />
                      <Route
                        path="/document"
                        element={<MyDocument />}
                        store={window.store}
                      />
                      <Route
                        path="/settings/profile"
                        element={<Profile />}
                        store={window.store}
                      />
                      <Route
                        path="/settings/organization"
                        element={<Organization />}
                        store={window.store}
                      />
                      <Route
                        path="/settings/members"
                        element={<Members />}
                        store={window.store}
                      />
                      <Route
                        path="/settings/subscription"
                        element={<Pricing />}
                      />
                      <Route path="/datasource" element={<DataSource />} />
                      <Route path="/chatbot" element={<Chatbot />} />
                    </Routes>
                  </div>
                </div>
              </>
            ) : (
              <>
                {' '}
                {/*  Not Logged In */}
                <Routes>
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/invite/:id" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Login />} />
                </Routes>
              </>
            )}
          </Router>
        </Provider>
      </ThemeProvider>
    );
  }
}

export default App;
