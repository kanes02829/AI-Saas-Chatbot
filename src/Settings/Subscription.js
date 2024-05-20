import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { observer, inject } from 'mobx-react';

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

const Subscription = ({ store }) => {
  return <></>;
};

export default withRouter(observer(inject('store')(Subscription)));
