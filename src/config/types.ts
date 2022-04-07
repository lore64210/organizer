type item = {
    id: string,
    value: string,
    position: number,
    type: string,
    checked: boolean,
}

type reminder = {
    id: string,
    title: string,
    items: item[],
    itemsImage: item[],
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