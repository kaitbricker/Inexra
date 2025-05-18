import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { notifications, markAsRead, clearAll } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return ChatBubbleLeftRightIcon;
      case 'conversation':
        return ChatBubbleLeftRightIcon;
      case 'account':
        return ExclamationCircleIcon;
      case 'error':
        return ExclamationCircleIcon;
      default:
        return BellIcon;
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <div
                        className={`flex items-start p-4 ${
                          active ? 'bg-gray-50' : ''
                        } ${notification.read ? 'opacity-75' : ''}`}
                      >
                        <div className="flex-shrink-0">
                          <Icon
                            className={`h-6 w-6 ${
                              notification.type === 'error'
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-4 flex-shrink-0"
                          >
                            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </Menu.Item>
                );
              })
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 