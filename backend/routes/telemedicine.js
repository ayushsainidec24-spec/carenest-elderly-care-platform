const crypto = require("crypto");
const express = require("express");
const os = require("os");

const router = express.Router();

const ROOM_TTL_MS = 1000 * 60 * 60 * 2;
const rooms = new Map();

function normalizePhoneNumber(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return "";
  return hasPlus ? `+${digits}` : digits;
}

function getRoomKey(phoneNumber) {
  return Buffer.from(phoneNumber).toString("base64url");
}

function serializeParticipant(participant) {
  return {
    id: participant.id,
    displayName: participant.displayName,
    phoneNumber: participant.phoneNumber,
    joinedAt: participant.joinedAt,
  };
}

function getLanIpAddress() {
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (
        entry.family === "IPv4" &&
        !entry.internal &&
        (/^192\.168\./.test(entry.address) ||
          /^10\./.test(entry.address) ||
          /^172\.(1[6-9]|2\d|3[0-1])\./.test(entry.address))
      ) {
        return entry.address;
      }
    }
  }

  return null;
}

function getShareBaseUrl(req) {
  const host = req.get("host") || "";
  const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
  const isLocalhost =
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host.startsWith("[::1]:");

  if (!isLocalhost) {
    return `${protocol}://${host}`;
  }

  const lanIp = getLanIpAddress();
  if (!lanIp) {
    return `${protocol}://${host}`;
  }

  const port = host.split(":")[1] || "80";
  return `${protocol}://${lanIp}:${port}`;
}

function cleanupRooms() {
  const now = Date.now();

  for (const [roomId, room] of rooms.entries()) {
    if (room.participants.size === 0 || now - room.updatedAt > ROOM_TTL_MS) {
      rooms.delete(roomId);
    }
  }
}

function getRoom(roomId) {
  cleanupRooms();
  return rooms.get(roomId);
}

router.post("/session", (req, res) => {
  cleanupRooms();

  const phoneNumber = normalizePhoneNumber(req.body.phoneNumber);
  const displayName = String(req.body.displayName || "Guest").trim();

  if (!phoneNumber) {
    return res.status(400).json({ error: "A valid customer phone number is required." });
  }

  const roomId = getRoomKey(phoneNumber);
  let room = rooms.get(roomId);

  if (!room) {
    room = {
      id: roomId,
      phoneNumber,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      signalId: 0,
      signals: [],
      participants: new Map(),
    };
    rooms.set(roomId, room);
  }

  if (room.participants.size >= 2) {
    return res.status(409).json({ error: "This call room is full." });
  }

  const participantId = crypto.randomUUID();
  const participant = {
    id: participantId,
    displayName: displayName || "Guest",
    phoneNumber,
    joinedAt: Date.now(),
    lastSeenAt: Date.now(),
  };

  room.participants.set(participantId, participant);
  room.updatedAt = Date.now();

  const joinLink = `/telemedicine?room=${encodeURIComponent(room.id)}`;

  res.json({
    sessionId: room.id,
    participantId,
    phoneNumber: room.phoneNumber,
    isInitiator: room.participants.size === 1,
    joinLink,
    shareUrl: `${getShareBaseUrl(req)}${joinLink}`,
    participants: Array.from(room.participants.values()).map(serializeParticipant),
  });
});

router.get("/session/:roomId", (req, res) => {
  const room = getRoom(req.params.roomId);
  const participantId = String(req.query.participantId || "");
  const since = Number(req.query.since || 0);

  if (!room) {
    return res.status(404).json({ error: "Call session not found." });
  }

  const participant = room.participants.get(participantId);
  if (!participant) {
    return res.status(404).json({ error: "Participant not found in this session." });
  }

  participant.lastSeenAt = Date.now();
  room.updatedAt = Date.now();

  const signals = room.signals.filter((signal) => {
    if (signal.id <= since) return false;
    if (signal.from === participantId) return false;
    if (signal.to && signal.to !== participantId) return false;
    return true;
  });

  res.json({
    roomId: room.id,
    phoneNumber: room.phoneNumber,
    participants: Array.from(room.participants.values()).map(serializeParticipant),
    signals,
    lastSignalId: room.signalId,
  });
});

router.post("/session/:roomId/signal", (req, res) => {
  const room = getRoom(req.params.roomId);

  if (!room) {
    return res.status(404).json({ error: "Call session not found." });
  }

  const participantId = String(req.body.participantId || "");
  const type = String(req.body.type || "");
  const payload = req.body.payload ?? null;
  const targetParticipantId = req.body.targetParticipantId
    ? String(req.body.targetParticipantId)
    : null;

  if (!room.participants.has(participantId)) {
    return res.status(404).json({ error: "Participant not found in this session." });
  }

  if (!type) {
    return res.status(400).json({ error: "Signal type is required." });
  }

  room.signalId += 1;
  room.updatedAt = Date.now();
  room.signals.push({
    id: room.signalId,
    from: participantId,
    to: targetParticipantId,
    type,
    payload,
    createdAt: Date.now(),
  });

  if (room.signals.length > 250) {
    room.signals = room.signals.slice(-250);
  }

  res.json({ ok: true, signalId: room.signalId });
});

router.delete("/session/:roomId/participant/:participantId", (req, res) => {
  const room = getRoom(req.params.roomId);

  if (!room) {
    return res.json({ ok: true, deleted: false });
  }

  const participantId = String(req.params.participantId || "");
  const deleted = room.participants.delete(participantId);

  if (deleted) {
    room.signalId += 1;
    room.updatedAt = Date.now();
    room.signals.push({
      id: room.signalId,
      from: participantId,
      to: null,
      type: "leave",
      payload: null,
      createdAt: Date.now(),
    });
  }

  if (room.participants.size === 0) {
    rooms.delete(room.id);
  }

  res.json({ ok: true, deleted });
});

module.exports = router;
