export interface Translations {
    HEADER: {
      HOME: string;
      CALENDAR: string;
      LOGIN: string;
      LOGIN_DIALOG: {
        TITLE: string;
        REGISTER: string;
        LOGIN_FORM: {
          USERNAME: string;
          USERNAME_ERR: string;
          PASSWORD: string;
          PASSWORD_ERR: string;
        };
      };
      USER_DIALOG: {
        SETTINGS: string;
        LOGOUT: string;
      };
    };
    HOME_PAGE: {
      TITLE: string;
      DESCRIPTION: string;
      HOW_IT_WORKS: {
        TITLE: string;
        STEP_1: {
          STRONG: string;
          TEXT: string;
        };
        STEP_2: {
          STRONG: string;
          TEXT: string;
        };
        STEP_3: {
          STRONG: string;
          TEXT: string;
        };
      };
      SELECT_TENANT: {
        TITLE: string;
        PLACEHOLDER: string;
        OPTIONS: string;
      };
      LOGIN_OPTIONS: {
        TITLE: string;
        DESCRIPTION: string;
        OWNER: {
          TITLE: string;
          DESCRIPTION: string;
          BUTTON: string;
        };
        ADMIN: {
          TITLE: string;
          DESCRIPTION: string;
          BUTTON: string;
        };
        REGULAR_USER: {
          TITLE: string;
          DESCRIPTION: string;
          BUTTON: string;
        };
        ALREADY_LOGGED: string;
      };
      FEATURES: {
        CUSTOMIZABLE_TENANTS: {
          TITLE: string;
          DESCRIPTION: string;
        };
        ROLE_BASED_ACCESS: {
          TITLE: string;
          DESCRIPTION: string;
        };
        PRIVACY_CONTROLS: {
          TITLE: string;
          DESCRIPTION: string;
        };
      };
    };
    CALENDAR: {
      SELECT_CALENDAR: string;
      SELECT_VIEW_TYPE: string;
      SELECT_VIEW_TYPE_OPTIONS: {
        DAY: string;
        WORKDAYS: string;
        WEEK: string;
        MONTH: string;
      };
      EMPTY_CALENDAR_LIST: string;
    };
    SETTINGS: {
      TITLE: string;
      EDIT: string;
      SAVE: string;
      CANCEL: string;
      CONFIRM: string;
      USER: {
        FORM: {
          TITLE: string;
          INFO: {
            EMAIL: string;
            EMAIL_PLACEHOLDER: string;
            EMAIL_ERR: string;
            USERNAME: string;
            USERNAME_PLACEHOLDER: string;
            USERNAME_ERR: string;
          };
          PASS: {
            CHANGE_PASS_TITLE: string;
            CURRENT_PASS: string;
            CURRENT_PASS_PLACEHOLDER: string;
            CURRENT_PASS_ERR: string;
            NEW_PASS: string;
            NEW_PASS_PLACEHOLDER: string;
            NEW_PASS_ERR: string;
            REPEAT_PASS: string;
            REPEAT_PASS_PLACEHOLDER: string;
            REPEAT_PASS_ERR: string;
            REPEAT_PASS_NOT_MATCH_ERR: string;
          };
        };
      };
      CALENDAR: {
        TITLE: string;
        SELECT_CALENDAR_OWNER: string;
        CALENDAR_TITLE: string;
        CALENDAR_TITLE_ERR: string;
        CALENDAR_TITLE_PLACEHOLDER: string;
        APPOINTMENT_REGISTERED: string;
        APPOINTMENT_REGISTERED_DATA_TIP: string;
        START_TIME: string;
        END_TIME: string;
        TIME_BETWEEN: string;
        APPLY_BREAK: string;
        START_LUNCH: string;
        END_LUNCH: string;
        WEEKDAYS: string;
        NO_CALENDAR: string;
      };
      MANAGEMENT: {
        TITLE: string;
        RESTRICTED_REGISTER: string;
        RESTRICTED_REGISTER_DATA_TIP: string;
        CREATE_CALENDAR: string;
        CALENDAR_OWNER: string;
        OWNER: string;
        DELETE: string;
        DELETE_MESSAGE: string;
        CREATE: string;
        CREATE_MESSAGE: string;
        NO_CALENDAR: string;
      };
    };
  }