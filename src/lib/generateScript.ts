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
  
  // Add PPPoE clients with default route enabled
  for (let i = 1; i <= count; i++) {
    script += `/interface pppoe-client\n`;
    script += `add interface=macvlan${i} name=pppoe-out${i} user=${username} password=${password} add-default-route=yes disabled=no\n\n`;
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
  
  return script.trim();
};

const generateLoadBalanceScript = (method: BalanceMethod, count: number) => {
  let script = '';
  
  script += `/ip firewall mangle\n`;
  
  if (method === 'per-connection') {
    // Per-connection method
    for (let i = 1; i <= count; i++) {
      script += `add chain=prerouting connection-mark=no-mark action=mark-connection new-connection-mark=pppoe_conn_${i} passthrough=yes per-connection-classifier=both-addresses-and-ports:${count}/${i-1}\n`;
      script += `add chain=prerouting connection-mark=pppoe_conn_${i} action=mark-routing new-routing-mark=to-pppoe-out${i} passthrough=no\n`;
    }
  } else {
    // Source address method
    for (let i = 1; i <= count; i++) {
      script += `add chain=prerouting src-address-list=LAN-ADDRESS-LIST action=mark-routing new-routing-mark=to-pppoe-out${i} passthrough=no per-connection-classifier=src-address:${count}/${i-1}\n`;
    }
  }

  // Add routing tables
  script += `\n/routing table\n`;
  for (let i = 1; i <= count; i++) {
    script += `add name=to-pppoe-out${i} fib\n`;
  }
  
  // Add routes
  script += `\n/ip route\n`;
  for (let i = 1; i <= count; i++) {
    script += `add dst-address=0.0.0.0/0 gateway=pppoe-out${i} routing-table=to-pppoe-out${i} check-gateway=ping\n`;
  }

  return script.trim();
};
