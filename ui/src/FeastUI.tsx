import React from "react";

import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { QueryParamProvider } from "use-query-params";
import RouteAdapter from "./hacks/RouteAdapter";
import FeastUISansProviders, { FeastUIConfigs } from "./FeastUISansProviders";
import {TokenProvider} from './contexts/TokenContext';

interface FeastUIProps {
  reactQueryClient?: QueryClient;
  feastUIConfigs?: FeastUIConfigs;
  feastRoutePath?: string;
  token?: string
}

const defaultQueryClient = new QueryClient();

const FeastUI = ({ reactQueryClient, feastUIConfigs, feastRoutePath, token }: FeastUIProps) => {
  const queryClient = reactQueryClient || defaultQueryClient;

  const getBasePath = () => {
    const path = window.location.pathname.split("/").filter(p => p !== "");
    let basename = ''
    if (path.length >= 5 && path[0] === "ru") basename = `${path[0]}/projects/${path[2]}/${feastRoutePath}/feature_store`;
    if (path.length >= 4 && path[0] !== "ru") basename = `/projects/${path[1]}/${feastRoutePath}/feature_store`;
    if (path[0] === 'feast') basename = path[1] ?`/${path[0]}/${path[1]}` : `/${path[0]}`
    return basename
  }

  return (
    <BrowserRouter basename={getBasePath()}>
      <TokenProvider>
        <QueryClientProvider client={queryClient}>
          <QueryParamProvider
            ReactRouterRoute={RouteAdapter as unknown as React.FunctionComponent}
          >
            <FeastUISansProviders token={token} feastUIConfigs={feastUIConfigs} />
          </QueryParamProvider>
        </QueryClientProvider>
      </TokenProvider>
    </BrowserRouter>
  );
};

export default FeastUI;
export type { FeastUIConfigs };
