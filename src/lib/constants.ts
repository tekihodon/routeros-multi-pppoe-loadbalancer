export const DEFAULT_LAN_RANGES = [
  "192.168.0.0/16",
  "172.16.0.0/12",
  "10.0.0.0/8",
];

export type BalanceMethod = "per-connection" | "src-address";

export const BALANCE_METHOD_HINTS = {
  "per-connection": "Băng thông được phân phối đồng đều cho tất cả các kết nối, tất cả PPPoE được sử dụng đồng thời",
  "src-address": "Mỗi địa chỉ IP được cấp DHCP sẽ được gán cố định vào một PPPoE bất kỳ"
};