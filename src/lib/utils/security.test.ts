import { describe, it, expect } from 'vitest';
import { isDestructiveCommand } from './security';

describe('isDestructiveCommand', () => {
  it('detects dangerous rm commands including split flags', () => {
    expect(isDestructiveCommand('rm -rf /var/log')).toBe(true);
    expect(isDestructiveCommand('sudo rm -r /etc')).toBe(true);
    expect(isDestructiveCommand('rm -r -f /var/log')).toBe(true);
    expect(isDestructiveCommand('rm -f -r /var/log')).toBe(true);
    expect(isDestructiveCommand('sudo rm -f -r /var/log')).toBe(true);
    expect(isDestructiveCommand('rm -f myfile.txt')).toBe(false);
    expect(isDestructiveCommand('rm myfile.txt')).toBe(false);
  });

  it('detects filesystem wipe and disk repartitioning', () => {
    expect(isDestructiveCommand('mkfs.ext4 /dev/sdb1')).toBe(true);
    expect(isDestructiveCommand('dd if=/dev/zero of=/dev/sda')).toBe(true);
    expect(isDestructiveCommand('wipefs -a /dev/nvme0n1')).toBe(true);
    expect(isDestructiveCommand('df -h')).toBe(false);
  });

  it('detects firewall flushing and dangerous docker prune regardless of flag order', () => {
    expect(isDestructiveCommand('iptables -F')).toBe(true);
    expect(isDestructiveCommand('docker system prune -a')).toBe(true);
    expect(isDestructiveCommand('docker system prune -a --volumes')).toBe(true);
    expect(isDestructiveCommand('docker system prune --volumes -a')).toBe(true);
    expect(isDestructiveCommand('docker system prune --volumes --all')).toBe(true);
    expect(isDestructiveCommand('docker system prune --volumes')).toBe(false);
    expect(isDestructiveCommand('docker system prune')).toBe(false);
    expect(isDestructiveCommand('docker ps')).toBe(false);
  });

  it('handles empty or non-destructive input gracefully', () => {
    expect(isDestructiveCommand('')).toBe(false);
    expect(isDestructiveCommand('ls -la')).toBe(false);
    expect(isDestructiveCommand('systemctl status nginx')).toBe(false);
  });
});
