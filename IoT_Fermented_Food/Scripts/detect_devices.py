import subprocess
import threading
import socket
from datetime import datetime

def ping(ip, results):
    try:
        # -t 1: timeout 1 second, -c 1: send 1 packet
        output = subprocess.run(['ping', '-t', '1', '-c', '1', ip], capture_output=True, text=True)
        if output.returncode == 0:
            try:
                hostname = socket.gethostbyaddr(ip)[0]
            except socket.herror:
                hostname = "Unknown"
            results.append((ip, hostname))
    except Exception:
        pass

def scan_network(network_prefix):
    print(f"Scanning network {network_prefix}.0/24...")
    start_time = datetime.now()
    threads = []
    results = []

    for i in range(1, 255):
        ip = f"{network_prefix}.{i}"
        t = threading.Thread(target=ping, args=(ip, results))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    end_time = datetime.now()
    results.sort(key=lambda x: [int(part) for part in x[0].split('.')])
    
    print(f"\nScan completed in {end_time - start_time}\n")
    print(f"{'IP Address':<15} | {'Hostname':<30}")
    print("-" * 50)
    for ip, hostname in results:
        print(f"{ip:<15} | {hostname:<30}")

if __name__ == "__main__":
    # Get local IP
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()

    if IP != '127.0.0.1':
        prefix = '.'.join(IP.split('.')[:-1])
        scan_network(prefix)
    else:
        print("Could not detect local IP.")
