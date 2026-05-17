import mongoose from 'mongoose';
import Notification from '../models/Notification';
import User from '../models/User';

interface NotifyOptions {
  type: string;
  title: string;
  message: string;
  link?: string;
  department?: mongoose.Types.ObjectId | string;
  meta?: any;
}

/**
 * Create a notification for one specific user.
 */
export async function notifyUser(userId: mongoose.Types.ObjectId | string, opts: NotifyOptions) {
  try {
    return await Notification.create({
      user: userId,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      link: opts.link,
      department: opts.department,
      meta: opts.meta,
    });
  } catch (err: any) {
    console.error('[Notify] Failed:', err.message);
  }
}

/**
 * Notify every user matching the role filter.
 * E.g., notifyByRole('SUPER_ADMIN', { ... }) → notifies all super admins.
 */
export async function notifyByRole(
  roles: string | string[],
  opts: NotifyOptions,
  scopeDepartment?: mongoose.Types.ObjectId | string
) {
  try {
    const roleList = Array.isArray(roles) ? roles : [roles];
    const q: any = { role: { $in: roleList }, active: true };
    if (scopeDepartment) q.department = scopeDepartment;
    const users = await User.find(q).select('_id department');
    if (!users.length) return;
    await Notification.insertMany(
      users.map((u) => ({
        user: u._id,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        link: opts.link,
        department: opts.department || u.department,
        meta: opts.meta,
      }))
    );
    console.log(`[Notify] Sent "${opts.title}" to ${users.length} ${roleList.join('/')} user(s)`);
  } catch (err: any) {
    console.error('[Notify] Bulk failed:', err.message);
  }
}
