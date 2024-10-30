import type { BalanceMethod } from './constants';

interface GenerateScriptParams {
  balanceMethod: BalanceMethod;
  pppoeCount: number;
  username: string;
  password: string;
  lanRanges: string[];
  ethernetId: string;
}

export const generateScripts = ({
  balanceMethod,
  pppoeCount,
  username,
  password,
  lanRanges,
  ethernetId,
}: GenerateScriptParams) => {
  // Generate MACVLAN and PPPoE script
  const macvlanScript = generateMacvlanScript(ethernetId, pppoeCount, username, password);
  
  // Generate LAN configuration script
  const lanScript = generateLanScript(lanRanges);
  
  // Generate load balancing script
  const loadBalanceScript = generateLoadBalanceScript(balanceMethod, pppoeCount);

  return {
    macvlanScript,
    lanScript,
    loadBalanceScript,
  };
};

const generateMacvlanScript = (ethernetId: string, count: number, username: string, password: string) => {
  let script = '';
  
  // Add MACVLAN interfaces
  for (let i = 1; i <= count; i++) {
    script += `/interface macvlan\n`;
    script += `add interface=${ethernetId} name=macvlan${i}\n\n`;
  }
  
  // Add PPPoE clients
  for (let i = 1; i <= count; i++) {
    script += `/interface pppoe-client\n`;
    script += `add interface=macvlan${i} name=pppoe-out${i} user=${username} password=${password} add-default-route=no disabled=no\n\n`;
  }
  
  return script.trim();
};

const generateLanScript = (lanRanges: string[]) => {
  let script = '';
  
  // Create address list for LAN ranges
  script += `/ip firewall address-list\n`;
  lanRanges.forEach(range => {
    script += `add address=${range} list=LAN-ADDRESS-LIST\n`;
  });
  
  script += `\n/ip firewall mangle\n`;
  script += `add action=accept chain=prerouting src-address-list=LAN-ADDRESS-LIST dst-address-list=LAN-ADDRESS-LIST\n`;
  
  return script.trim();
};

const generateLoadBalanceScript = (method: BalanceMethod, count: number) => {
  let script = '';
  
  // Create routing marks
  script += `/ip firewall mangle\n`;
  
  if (method === 'per-connection') {
    // Mark connections for equal distribution
    script += `add action=mark-connection chain=prerouting dst-address-list=!LAN-ADDRESS-LIST src-address-list=LAN-ADDRESS-LIST connection-mark=no-mark per-connection-classifier=both-addresses-and-ports:${count} new-connection-mark=conn_\n`;
    
    // Mark routing based on connections
    for (let i = 1; i <= count; i++) {
      script += `add action=mark-routing chain=prerouting connection-mark=conn_${i-1} new-routing-mark=to_pppoe${i}\n`;
    }
  } else {
    // Mark routing based on source address
    for (let i = 1; i <= count; i++) {
      script += `add action=mark-routing chain=prerouting dst-address-list=!LAN-ADDRESS-LIST src-address-list=LAN-ADDRESS-LIST per-connection-classifier=src-address:${count} new-routing-mark=to_pppoe${i}\n`;
    }
  }

  // Create routing tables
  script += `\n/routing table\n`;
  for (let i = 1; i <= count; i++) {
    script += `add name=to_pppoe${i} fib\n`;
  }
  
  // Add routes to routing tables
  script += `\n/ip route\n`;
  for (let i = 1; i <= count; i++) {
    script += `add dst-address=0.0.0.0/0 gateway=pppoe-out${i} routing-table=to_pppoe${i} check-gateway=ping\n`;
  }

  // Add main rules
  script += `\n/ip firewall mangle\n`;
  script += `add action=accept chain=prerouting src-address-list=LAN-ADDRESS-LIST dst-address-list=LAN-ADDRESS-LIST\n`;
  script += `add action=accept chain=prerouting dst-address-list=LAN-ADDRESS-LIST\n`;
  script += `add action=mark-connection chain=prerouting dst-address-list=!LAN-ADDRESS-LIST src-address-list=LAN-ADDRESS-LIST connection-mark=no-mark new-connection-mark=conn_wan passthrough=yes\n`;
  script += `add action=mark-routing chain=prerouting connection-mark=conn_wan new-routing-mark=main\n`;
  
  return script.trim();
};