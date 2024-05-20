import React, { Component } from 'react';
import { computed, observable, makeObservable, makeAutoObservable } from 'mobx';
import Header from '../Components/Header';
import {
  IdentificationIcon,
  CheckIcon,
  ChatAltIcon,
  UserCircleIcon,
  ReplyIcon,
  ChevronLeftIcon,
  DatabaseIcon,
} from '@heroicons/react/outline';
import MainBody from '../Components/Body';
import Referral from './Referral';
import Feedback from './Feedback';
import { Helmet } from 'react-helmet';
import {
  useLocation,
  useNavigate,
  useParams,
  Navigate,
  Link,
} from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import Pricing from '../Pricing';

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
class Body extends Component {
  @observable plan = {
    plan: '',
  };
  constructor(props) {
    super(props);

    makeObservable(this);
    this.init();
  }

  get headerMessage() {
    const { profile } = this.props.store;
    console.log('status: ', profile.status);
    if (profile.status === 'trialing') {
      return '7 Day Trial';
    }
    if (profile.status === 'active') {
      if (profile.cancel_at_period_end) {
        return `Set to cancel soon`;
      }
      return `${profile.plan} Plan`;
    }
    if (profile.status === 'incomplete') {
      return `${profile.plan} Plan Restarted`;
    }
    return 'Expired';
  }

  get ifNotActive() {
    const { profile } = this.props.store;
    if (profile.cancel_at_period_end) {
      return 'Canceled';
    }
    if (profile.status === 'trialing') {
      return 'Trialing';
    }
    return false;
  }

  get fromColor() {
    const { profile } = this.props.store;
    if (profile.status === 'trialing') {
      return 'gray-400';
    }
    if (profile.status === 'active') {
      if (profile.cancel_at_period_end) {
        return 'yellow-500';
      }
      return 'green-500';
    }
    if (profile.status === 'incomplete') {
      return 'yellow-600';
    }
    return 'red-500';
  }

  get currentPeriodEnd() {
    // console.log(this.props.store.profile.current_period_end)
    const { profile } = this.props.store;
    if (profile.current_period_end && profile.current_period_end.length > 0) {
      var days_difference = Math.round(
        (new Date(profile.current_period_end).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (days_difference < 0) {
        return 0;
      }
      return days_difference;
    }
    return 0;
  }

  // componentDidMount() {
  //   this.props.store.refreshTokenAndProfile();
  //   makeObservable(this);
  //   this.init();
  // }

  componentWillMount() {
    this.props.store.refreshTokenAndProfile();

    makeObservable(this);
    this.init();
  }

  init = async () => {
    let res = await this.props.store.api.post('/user/stripe/plan');
    this.plan = {
      ...res.data,
    };
    console.log(`this.plan`, { ...this.plan });
  };

  onBack = () => {
    this.props.history.push(`/my-profile`);
  };

  render() {
    return (
      <>
        {/* <Header
					title={this.props.store.profile.email}
					desc={`${this.props.store.profile.fname} ${this.props.store.profile.lname}`}
					category="Your Profile"
					Icon={UserCircleIcon}
					fromColor={this.fromColor}
					options={
						this.props.location.pathname !== "/my-profile" ? [{ title: "Back to Profile", Icon: ChevronLeftIcon, onClick: this.onBack }] : null
					}
				>
					<Route exact path="/my-profile">
						<Helmet>
							<title>{`My Profile - AI`}</title>
						</Helmet>

					</Route>

				</Header> */}
        <MainBody className="px-4 py-4 md:px-28 md:py-8 lg:py-12">
          <Grid>
            {this.plan.status === 'trialing' ? (
              <ToolForm
                Icon={CheckIcon}
                title={`Active Subscription`}
                desc={`${this.plan.plan === 'Entry' ? '$30' : ''}${
                  this.plan.plan === 'Pro' ? '$90' : ''
                } billing  immediately. Ends trial and starts billing plan.`}
                to={this.props.store.baseURL + '/user/stripe/activate'}
                api={this.props.store.api}
                fromColor="purple-500"
                toColor="indigo-600"
              />
            ) : null}

            {this.plan.plan === 'None' ? (
              <Tool
                Icon={IdentificationIcon}
                title={'Pricing Plans'}
                api={this.props.store.api}
                desc={'Upgrade, downgrade or cancel anytime.'}
                to={'/my-profile/pricing'}
                fromColor="red-400"
              />
            ) : null}

            {this.headerMessage === 'Expired' ? null : (
              <>
                {this.ifNotActive ? null : (
                  <>
                    <ToolForm
                      Icon={IdentificationIcon}
                      title={'Cancel Subscription'}
                      api={this.props.store.api}
                      desc={
                        'Immediately cancelation of subscription and payments.'
                      }
                      to={this.props.store.baseURL + 'user/stripe/cancel'}
                      fromColor={
                        this.props.store.profile.cancel_at_period_end
                          ? 'red-600'
                          : 'red-500'
                      }
                      toColor={
                        this.props.store.profile.cancel_at_period_end
                          ? 'red-400'
                          : 'red-600'
                      }
                    />

                    <ToolForm
                      Icon={DatabaseIcon}
                      title={'Buy Credits'}
                      desc={'250 x extra credits quick-buy'}
                      to={this.props.store.baseURL + 'user/stripe/buy250'}
                      api={this.props.store.api}
                      fromColor="purple-500"
                      toColor="indigo-600"
                    />
                  </>
                )}

                {this.props.store.profile.cancel_at_period_end ? (
                  <>
                    <ToolForm
                      Icon={CheckIcon}
                      title={'Reactivate Subscription'}
                      api={this.props.store.api}
                      desc={
                        'Immediately cancelation of subscription and payments.'
                      }
                      to={this.props.store.baseURL + 'user/stripe/uncancel'}
                      fromColor={
                        this.props.store.profile.cancel_at_period_end
                          ? 'green-400'
                          : 'green-500'
                      }
                      toColor={
                        this.props.store.profile.cancel_at_period_end
                          ? 'green-400'
                          : 'green-500'
                      }
                    />
                  </>
                ) : null}
                <ToolForm
                  Icon={IdentificationIcon}
                  title={
                    this.props.store.profile.cancel_at_period_end
                      ? 'Manage Subscription'
                      : 'Update Subscription'
                  }
                  api={this.props.store.api}
                  desc={
                    'Change your plan, card details, or cancel the plan anytime.'
                  }
                  to={this.props.store.baseURL + 'user/stripe/customer-portal'}
                  fromColor={
                    this.props.store.profile.cancel_at_period_end
                      ? 'blue-600'
                      : 'blue-500'
                  }
                  toColor={
                    this.props.store.profile.cancel_at_period_end
                      ? 'blue-400'
                      : 'blue-600'
                  }
                />
              </>
            )}

            <>
              <Tool
                Icon={ChatAltIcon}
                title={'Feedback'}
                desc={'Provide comments on your experience'}
                to={'/my-profile/feedback'}
                fromColor="gray-400"
                toColor="gray-400"
              />
            </>

            <>
              <ToolDiv
                Icon={ReplyIcon}
                title={'Log Out'}
                desc={'Sign out of your account'}
                onClick={() => {
                  this.props.store.handleLogout();
                  this.props.navigate('/');
                }}
                fromColor="gray-400"
                toColor="gray-400"
              />
            </>
            {/* </Route>
            </Routes> */}
          </Grid>
        </MainBody>
      </>
    );
  }
}

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 gap-8 mt-4 lg:grid-cols-2 xl:grid-cols-3 ">
    {children}
  </div>
);

const ToolDiv = ({
  Icon,
  title,
  desc,
  to,
  group,
  fromColor,
  toColor,
  onClick,
}) => (
  <>
    <div className="flex relative " onClick={onClick}>
      <div
        className={`absolute inset-0 bg-gradient-to-r from-${
          fromColor ? fromColor : 'green-400'
        } to-${
          toColor ? toColor : 'blue-500'
        } shadow-lg transform skew-y-0 -rotate-3 rounded-3xl `}
      ></div>

      <div
        className={`flex-1 bg-white rounded-xl transition hover:shadow-md overflow-hidden md:max-w-1lg text-gray-500 cursor-pointer border-t-2 border- hover:border-${
          fromColor ? fromColor : 'blue-400'
        } md:flex relative transform hover:scale-105  hover:text-black`}
      >
        {Icon && (
          <div
            className={`md:flex-shrink-0 flex justify-start items-center ml-8 text-${
              fromColor ? fromColor : 'green-500'
            }`}
          >
            <Icon className="h-16 w-16 mb-4 mt-4" />
          </div>
        )}
        <div className="p-4">
          <div
            className={`uppercase tracking-wide text-sm text-${
              fromColor ? fromColor : 'green-500'
            } font-semibold leading-none`}
          >
            {group || ''}
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
    </div>
  </>
);

const ToolForm = ({
  Icon,
  title,
  desc,
  to,
  group,
  fromColor,
  toColor,
  onClick,
  api,
}) => (
  <>
    <form action={to} method="POST" className="flex relative">
      <input
        type="hidden"
        name="token"
        autoComplete="off"
        value={api.defaults.headers.common['x-access-token']}
      />
      <button type="submit" className="flex-1 text-left">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-${
            fromColor ? fromColor : 'green-400'
          } to-${
            toColor ? toColor : 'blue-500'
          } shadow-lg transform skew-y-0 -rotate-3 rounded-3xl `}
        ></div>

        <div
          type="submit"
          className={`flex-1 bg-white rounded-xl transition hover:shadow-md overflow-hidden md:max-w-1lg text-gray-500 cursor-pointer border-t-2 border- hover:border-${
            fromColor ? fromColor : 'blue-400'
          } md:flex relative transform hover:scale-105  hover:text-black`}
        >
          {Icon && (
            <div
              className={`md:flex-shrink-0 flex justify-start items-center ml-8 text-${
                fromColor ? fromColor : 'green-500'
              }`}
            >
              <Icon className="h-16 w-16 mb-4 mt-4" />
            </div>
          )}
          <div className="p-4">
            <div
              className={`uppercase tracking-wide text-sm text-${
                fromColor ? fromColor : 'green-500'
              } font-semibold leading-none`}
            >
              {group || ''}
            </div>
            <div className="block text-lg xl:text-xl 2xl:text-2xl leading-tight font-medium text-black leading-none">
              {title}
            </div>
            <p className="mt-1 pr-1 text-sm ">{desc} </p>
          </div>
        </div>
      </button>
    </form>
  </>
);

const Tool = ({
  Icon,
  title,
  desc,
  to,
  group,
  fromColor,
  toColor,
  onClick,
  api,
}) => (
  <Link to={to} className="flex relative">
    <div className="flex-1 text-left">
      <div
        className={`absolute inset-0 bg-gradient-to-r from-${
          fromColor ? fromColor : 'green-400'
        } to-${
          toColor ? toColor : 'blue-500'
        } shadow-lg transform skew-y-0 -rotate-3 rounded-3xl `}
      ></div>

      <div
        className={`flex-1 bg-white rounded-xl transition hover:shadow-md overflow-hidden md:max-w-1lg text-gray-500 cursor-pointer border-t-2 border- hover:border-${
          fromColor ? fromColor : 'blue-400'
        } md:flex relative transform hover:scale-105  hover:text-black`}
      >
        {Icon && (
          <div
            className={`md:flex-shrink-0 flex justify-start items-center ml-8 text-${
              fromColor ? fromColor : 'green-500'
            }`}
          >
            <Icon className="h-16 w-16 mb-4 mt-4" />
          </div>
        )}
        <div className="p-4">
          <div
            className={`uppercase tracking-wide text-sm text-${
              fromColor ? fromColor : 'green-500'
            } font-semibold leading-none`}
          >
            {group || ''}
          </div>
          <div className="block text-lg xl:text-xl 2xl:text-2xl leading-tight font-medium text-black leading-none">
            {title}
          </div>
          <p className="mt-1 pr-1 text-sm ">{desc} </p>
        </div>
      </div>
    </div>
  </Link>
);

export default withRouter(Body);
