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

  // Generate IP address lists based on LAN ranges
  const addressListScript = generateAddressListScript(lanRanges, pppoeCount);
  
  // Generate mangle rules for address lists
  const mangleAddressListScript = generateMangleAddressListScript(pppoeCount);

  return {
    macvlanScript,
    lanScript,
    loadBalanceScript,
    addressListScript,
    mangleAddressListScript,
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
  
  // Add routing tables first
  script += `/routing table\n`;
  for (let i = 1; i <= count; i++) {
    script += `add name=to-pppoe-out${i} fib\n`;
  }
  
  // Add routes - removed check-gateway=ping parameter
  script += `\n/ip route\n`;
  for (let i = 1; i <= count; i++) {
    script += `add dst-address=0.0.0.0/0 gateway=pppoe-out${i} routing-table=to-pppoe-out${i}\n`;
  }

  // Add mangle rules after routing tables and routes
  script += `\n/ip firewall mangle\n`;
  
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

  return script.trim();
};

/**
 * Generates a script to create address lists based on LAN ranges and PPPoE count
 * Each address list will include IP ranges distributed by the last octet
 */
const generateAddressListScript = (lanRanges: string[], count: number) => {
  let script = '';
  
  script += `/ip firewall address-list\n`;
  
  // For each LAN range, distribute IPs across PPPoE connections
  lanRanges.forEach(range => {
    try {
      // Parse the CIDR notation
      const [baseIp, cidrMask] = range.split('/');
      const ipParts = baseIp.split('.');
      
      // Skip invalid IP formats
      if (ipParts.length !== 4) return;
      
      const networkPrefix = `${ipParts[0]}.${ipParts[1]}.`;
      
      // Distribute IPs across PPPoE connections based on the third octet
      for (let i = 1; i <= count; i++) {
        // For each PPPoE, add corresponding IP ranges
        script += `add address=${networkPrefix}${i}.0/24 list=pppoe-out${i}\n`;
      }
    } catch (error) {
      // Skip invalid CIDR notations
      console.error(`Invalid CIDR notation: ${range}`);
    }
  });
  
  return script.trim();
};

/**
 * Generates mangle rules that use the created address lists (pppoe-out1, pppoe-out2, etc.)
 * to mark routing to corresponding routing marks
 */
const generateMangleAddressListScript = (count: number) => {
  let script = '';
  
  script += `/ip firewall mangle\n`;
  
  // Create mangle rules for each PPPoE connection
  for (let i = 1; i <= count; i++) {
    script += `add chain=prerouting src-address-list=pppoe-out${i} action=mark-routing new-routing-mark=to-pppoe-out${i} passthrough=no\n`;
  }
  
  return script.trim();
};
