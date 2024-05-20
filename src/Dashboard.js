import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { computed } from 'mobx';
import MainBody from './Components/Body';
import { Helmet } from 'react-helmet';

import { observer, inject } from 'mobx-react';

import { NavigationBar } from './Components/NavigationBar';

@inject('store')
@observer
class Body extends Component {
  state = {
    currentIdx: 0,
  };

  get permissions() {
    return this.props.store.tools.filter((tool) =>
      tool.permissions.some((r) =>
        this.props.store.profile.permissions.includes(r)
      )
    );
  }

  get beta() {
    return this.permissions.filter((tool) => tool.category === 'Beta');
  }

  get personal() {
    return this.permissions.filter((tool) => tool.category === 'Personal');
  }

  get business() {
    return this.permissions.filter((tool) => tool.category === 'Business');
  }

  get social() {
    return this.permissions.filter((tool) => tool.category === 'Social');
  }

  get content() {
    return this.permissions.filter((tool) => tool.category === 'Ads');
  }

  get programming() {
    return this.permissions.filter((tool) => tool.category === 'Article');
  }

  render() {
    const navigationHandler = (idx) => {
      this.setState({
        currentIdx: idx,
      });
    };
    console.log(this.props.store.currentOrgInfo);
    return (
      <div>
        <Helmet>
          <title>{`AI-to-Social`}</title>
        </Helmet>
        <MainBody>
          <div style={{ fontSize: 'xx-large', marginBottom: '50px' }}>
            &nbsp;&nbsp;Templates&nbsp;&nbsp;
            <div class="word-used-wrapper">
              <i className="fa fa-bar-chart"></i>
              <i id="quick-words-left">0</i> / 100,000
              <strong> Words Used</strong>
            </div>
          </div>
          <NavigationBar navigationHandler={navigationHandler} />
          {this.state.currentIdx <= 1 && this.programming.length ? (
            <>
              <Title title="Article And Blogs" />
              <Divider />
              <Grid>
                {this.programming.map((tool, index) => (
                  <Tool
                    key={index}
                    group={tool.category}
                    title={tool.title}
                    to={tool.to}
                    Icon={tool.Icon}
                    desc={tool.desc}
                    fromColor={tool.fromColor}
                    toColor={tool.toColor}
                  />
                ))}
              </Grid>
            </>
          ) : null}

          {(this.state.currentIdx === 0 || this.state.currentIdx === 2) &&
          this.content.length ? (
            <>
              <Title title="Ads And Marketing Tools" />
              <Divider />
              <Grid>
                {this.content.map((tool, index) => (
                  <Tool
                    key={index}
                    group={tool.category}
                    title={tool.title}
                    to={tool.to}
                    Icon={tool.Icon}
                    desc={tool.desc}
                    fromColor={tool.fromColor}
                    toColor={tool.toColor}
                  />
                ))}
              </Grid>
            </>
          ) : null}

          {(this.state.currentIdx === 0 || this.state.currentIdx === 3) &&
          this.social.length ? (
            <>
              <Title title="Social Media" />
              <Divider />
              <Grid>
                {this.social.map((tool, index) => (
                  <Tool
                    key={index}
                    group={tool.category}
                    title={tool.title}
                    to={tool.to}
                    Icon={tool.Icon}
                    desc={tool.desc}
                    fromColor={tool.fromColor}
                    toColor={tool.toColor}
                  />
                ))}
              </Grid>
            </>
          ) : null}
        </MainBody>
      </div>
    );
  }
}

export const Divider = () => (
  <div className="divide-y-2 divide-dashed divide-gray-300 mb-6 md:mb-8">
    {' '}
    <div></div>
    <div></div>
  </div>
);

export const Title = ({ title }) => (
  <h2 className="text-xl sm:text-2xl md:text-2xl text-gray-700 mt-4 md:mt-6">
    {title}
  </h2>
);

export const Grid = ({ children }) => (
  <div className="grid grid-cols-1 gap-8 mt-4 lg:grid-cols-2 xl:grid-cols-3 ">
    {children}
  </div>
);

export const Tool = ({ Icon, title, desc, to, group, fromColor, toColor }) => (
  <Link to={to || '/'} className="flex relative ">
    <div
      className={`bg-white flex-1 rounded-xl transition hover:shadow-md overflow-hidden md:max-w-1lg text-gray-500 cursor-pointer border border-gray-300 md:flex relative transform hover:scale-105  hover:text-black`}
    >
      <div className="p-4">
        <div
          className={`uppercase tracking-wide text-sm text-${
            fromColor ? fromColor : 'green-500'
          } font-semibold leading-none`}
        >
          {group || 'New'}
        </div>
        <div
          href="#"
          className="block text-lg xl:text-xl 2xl:text-2xl leading-tight font-medium text-black leading-none"
        >
          {title}
        </div>
        <p className="mt-1 pr-1 text-sm ">{desc} </p>
      </div>
    </div>
  </Link>
);

export default Body;
