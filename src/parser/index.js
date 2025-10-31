/**
 * Example Nginx log line:
 * 192.168.0.1 - - [29/Oct/2025:10:45:32 +0000] "GET /home HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
 */
const parseLogLine = (line) => {
    if (!line || line.trim() === '') return null;

    const parts = line.split(' ');
    const ip = parts[0];

    const timeStart = line.indexOf('[');
    const timeEnd = line.indexOf(']');
    if (timeStart === -1 || timeEnd === -1) return null;

    const rawTime = line.substring(timeStart + 1, timeEnd);

    const timestamp = new Date(rawTime.replace(':', ' ').replace(/\//g, '-')).toISOString();

    const requestStart = line.indexOf('"');
    const requestEnd = line.indexOf('"', requestStart + 1);
    const request = line.substring(requestStart + 1, requestEnd).split(' ');
    const method = request[0] || null;
    const route = request[1] || null;

    const afterRequest = line.substring(requestEnd + 1).trim().split(' ');
    const status = parseInt(afterRequest[0], 10) || null;
    const bytes = parseInt(afterRequest[1], 10) || null;

    const rest = line.substring(requestEnd + 1);
    const referrerStart = rest.indexOf('"');
    const referrerEnd = rest.indexOf('"', referrerStart + 1);
    let referrer = referrerStart !== -1 ? rest.substring(referrerStart + 1, referrerEnd) : null;

    const userAgentStart = rest.indexOf('"', referrerEnd + 1);
    const userAgentEnd = rest.lastIndexOf('"');
    let userAgent =
        userAgentStart !== -1 && userAgentEnd > userAgentStart
            ? rest.substring(userAgentStart + 1, userAgentEnd)
            : null;
    // escape single quotes to safely insert into persistence
    const escape = (str) => str ? str.replace(/'/g, "''") : str;

    return {
        ip: escape(ip),
        method: escape(method),
        route: escape(route),
        status,
        bytes,
        timestamp,
        referrer: escape(referrer),
        user_agent: escape(userAgent),
        raw_line: escape(line)
    };
};

module.exports = {
    parseLogLine
};