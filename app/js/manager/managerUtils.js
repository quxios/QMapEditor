export default class ManagerUtils {
  arrMove(arr, oldIndex, newIndex) {
    const elem = arr[oldIndex];
    arr.splice(oldIndex, 1);
    arr.splice(newIndex, 0, elem);
  }
  getUniqName(arr, prop, base, i = 0) {
    let name;
    let valid = false;
    while (!valid) {
      name = `${base}${i}`;
      valid = true;
      for (let j = 0; j < arr.length; j++) {
        if (arr[j][prop] === name) {
          valid = false;
          break;
        }
      }
      i++;
      if (i > 10) break;
    }
    return name;
  }
}
