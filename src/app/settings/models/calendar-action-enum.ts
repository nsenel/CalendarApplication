export enum CalendarAction {
    DELETE = 'Delete',
    ADD = 'Add',
    EDIT = 'Edit',
    OWNER_CHANGE = 'OWNER_CHANGE'
}

export type CalendarActionPayload = {
    action: CalendarAction;
    calendarID: string;
    title: string;
};
