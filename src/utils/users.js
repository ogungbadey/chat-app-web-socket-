const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate data
  if (!username || !room) return { error: "Username and room required" };

  // Check for existing user
  const existingUser = users.find(user => user.room === room && user.username === username);

  if (existingUser) return { error: "Username is taken" };

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const userIndex = users.findIndex(user => user.id === id);

  if (userIndex !== -1) return users.splice(userIndex, 1)[0];
};

const getUser = id => {
  const foundUser = users.find(user => user.id === id);
  if (!foundUser) return undefined;
  return foundUser;
};

const getUsersInRoom = room => {
  const usersInRoom = users.filter(user => user.room === room);
  if (!usersInRoom) return undefined;
  return usersInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}