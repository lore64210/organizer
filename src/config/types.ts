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

export {
    item,
    reminder,
};