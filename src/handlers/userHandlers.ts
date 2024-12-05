import { createFactory } from 'hono/factory';
import { UserPayload } from '../types';
import { STATUS } from '../config/status';
import prisma from '../prisma/client';
import { FORBIDDEN, NOT_FOUND } from '../http-status-codes';

const factory = createFactory<{ Variables: { user: UserPayload } }>();

const getUserFromCookies = factory.createHandlers(async c => {
  // Get user data from c.var.user (passed through validateTokens middleware)
  const { user } = c.var;

  // Send response
  return c.json({
    status: STATUS.SUCCESS,
    time: new Date().getTime(),
    message: `User ${user.username} logged in successfully from cookies`,
    user: { ...user, roles: JSON.parse(user.roles) },
  });
});

const getAllUsers = factory.createHandlers(async c => {
  // Find all users, exclude password and __v. Return new array with userId instead of _id.
  const users = (await prisma.user.findMany()).map(
    ({ password, roles, ...rest }) => ({ ...rest, roles: JSON.parse(roles) })
  );

  // If no users found, return message
  if (!users) {
    return c.json({
      status: STATUS.SUCCESS,
      time: new Date().getTime(),
      message: 'No users found',
    });
  }

  // Return all users
  return c.json({
    status: STATUS.SUCCESS,
    time: new Date().getTime(),
    message: 'Retrieved users successfully',
    users,
  });
});

const updateUser = factory.createHandlers(async c => {
  // Get userId from param
  const userId = c.req.param('userId');
  const json = await c.req.json();
  if ('roles' in json) {
    json.roles = JSON.stringify(json.roles);
  }

  // Find and update user
  const updatedUser = await prisma.user.update({
    where: { userId },
    data: { ...json },
  });

  // Return response
  return c.json({
    status: STATUS.SUCCESS,
    time: new Date().getTime(),
    message: `Updated user ${updatedUser.username}`,
  });
});

const deleteUser = factory.createHandlers(async c => {
  // Get userId from param
  const userId = c.req.param('userId');

  // You can't delete yourself
  if (c.var.user.userId === userId) {
    c.status(FORBIDDEN);
    throw new Error("You can't delete yourself");
  }

  // Find and delete user
  const deletedUser = await prisma.user.delete({
    where: { userId },
    include: { _count: { select: { sessions: true } } },
  });

  if (!deletedUser) {
    c.status(NOT_FOUND);
    throw new Error('User not found');
  }

  // Return response
  return c.json({
    status: STATUS.SUCCESS,
    time: new Date().getTime(),
    message: `User ${deletedUser.username} deleted successfully\n${deletedUser._count.sessions} sessions deleted successfully`,
  });
});

export { getUserFromCookies, getAllUsers, updateUser, deleteUser };
