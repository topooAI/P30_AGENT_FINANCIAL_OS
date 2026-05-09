// P30 Dashboard Logic Simulation

document.addEventListener('DOMContentLoaded', () => {
    console.log('P30 OS Dashboard Initialized.');

    // Simulate real-time capital updates
    const amountEl = document.querySelector('.amount');
    let currentAmount = 1042.85;

    setInterval(() => {
        const change = (Math.random() - 0.45) * 0.1; // Slight upward bias
        currentAmount += change;
        amountEl.textContent = `$${currentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Pulse effect on update
        amountEl.style.transition = 'color 0.2s';
        amountEl.style.color = change >= 0 ? 'var(--accent-green)' : 'var(--accent-orange)';
        setTimeout(() => {
            amountEl.style.color = 'var(--text-main)';
        }, 300);
    }, 3000);

    // Simulate Log Stream
    const logContainer = document.getElementById('log-container');
    const logs = [
        { type: 'info', msg: 'Intelligence-Agent: New article detected on Reuters regarding PA polling.' },
        { type: 'success', msg: 'Calculation-Agent: Updated Arb opportunity for GA Election: 2.15%' },
        { type: 'info', msg: 'Shadow-Bot: swisstony adjusting bid/ask spread on BTC market.' },
        { type: 'warn', msg: 'Risk-Agent: Exposure in "Trump wins" exceeding 15% threshold.' },
        { type: 'success', msg: 'Execution-Agent: Limit order filled: $12.5 on "No" outcomes.' }
    ];

    setInterval(() => {
        const log = logs[Math.floor(Math.random() * logs.length)];
        const time = new Date().toLocaleTimeString([], { hour12: false });
        
        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-msg-${log.type}">${log.msg}</span>`;
        
        logContainer.appendChild(line);
        if (logContainer.children.length > 8) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }, 5000);

    // Dynamic Arb Radar updates
    const arbPcts = document.querySelectorAll('.arb-pct');
    setInterval(() => {
        arbPcts.forEach(el => {
            const current = parseFloat(el.textContent);
            const next = Math.max(0, current + (Math.random() - 0.5) * 0.2);
            el.textContent = `${next.toFixed(2)}%`;
            
            if (next > 1.5) {
                el.parentElement.parentElement.style.borderColor = 'var(--accent-green)';
            } else {
                el.parentElement.parentElement.style.borderColor = 'var(--border-color)';
            }
        });
    }, 4000);
});
