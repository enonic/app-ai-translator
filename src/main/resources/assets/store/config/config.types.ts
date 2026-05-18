export type Config = {
  licenseServiceUrl: string;
  wsServiceUrl: string;
  user: {
    fullName: string;
    shortName: string;
  };
  instructions: string;
};

export type ConfigData = {
  payload: {
    user?: {
      fullName: string;
      shortName: string;
    };
    instructions?: string;
  };
};
