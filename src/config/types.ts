type reminderValue = {
    date: string, 
    time: string, 
    title: string
}

type item = {
    id: string,
    value: reminderValue | string,
    type: string,
    checked: boolean,
}

type reminder = {
    id: string,
    title: string,
    items: item[],
    imageItems: item[],
    hide: boolean,
}

type theme = {
    textColor: string,
    placeholderTextColor: string,
    backgroundColor: string,
    primaryColor: string,
    secondaryColor: string,
    buttonSize: number,
    borderRadius: number,
    borderRadiusButton: number,
}

export {
    item,
    reminder,
    theme,
};