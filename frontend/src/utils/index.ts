export const getAddressShortcut = (
  address: string,
  headLength: number,
  tailLength: number
) => {
  return `${address.substring(0, headLength)}...${address.substring(
    address.length - tailLength,
    address.length
  )}`;
};

export const getHashShortcut = (
  address: string,
  headLength: number,
  tailLength: number
) => {
  if (!address) {
    return "";
  }
  return `${address.substring(0, headLength)}...${address.substring(
    address.length - tailLength,
    address.length
  )}`;
};
