export const isBrowser = typeof window !== "undefined";

export const limitChar = (string, limit) => {
  if (string.length < limit) return string;
  return string.slice(0, limit) + "...";
};

export const requestHandler = async (api, setLoading, onSuccess, onError) => {
  setLoading && setLoading(true);

  try {
    const res = await api();
    const { data } = res;

    if (data?.statusCode === "10000") {
      onSuccess(data);
    }
  } catch (error) {
    console.error("Error:", error); 
    onError(error?.response?.data?.message || "Something went wrong");
  } finally {
    setLoading && setLoading(false);
  }
};

export class LocalStorage {
  static get(key) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);

    if (value) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  // set a value in the localStorage
  static set(key, value) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // remove a value from the localStorage
  static remove(key) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  // clear the localStorage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}

export const getChatObjectMetadata = (chat, currentUser) => {
  const lastMessage = chat.lastMessage?.content
    ? chat.lastMessage?.content
    : chat.lastMessage
    ? `${chat.lastMessage?.attachments?.length} attachment${
        chat.lastMessage.attachments.length > 1 ? "s" : ""
      }`
    : " No messages yet";

  if (chat.isGroupChat) {
    return {
      avatar: "https://via.placeholder.com/100x100.png", 
      title: chat.name,
      description: `${chat.participants.length} members joined`,
      lastMessage: chat.lastMessage
        ? chat.lastMessage.sender?.username + ":" + lastMessage
        : lastMessage,
    };
  } else {
    const participant = chat.participants?.find(
      (participant) => participant._id !== currentUser?._id
    );

    return {
      avatar: participant?.avatarUrl,
      title: participant?.username,
      description: participant?.email,
      lastMessage,
    };
  }
};

export const getOpponentParticipant = (participants, currentUserId) => {
  return participants?.find((participant) => participant._id !== currentUserId);
};

// function to check if a string is valid json object
export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
