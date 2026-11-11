export const APPLICATION_STATUS = [
  "Saved",
  "Applied",
  "For Interview",
  "Offer",
  "Accepted",
  "Declined",
  "Rejected",
];

export const REGEX_PATTERNS = {
  name: {
    regex: /^\p{L}[\p{L}\s.'-]*$/u,
    msg: "Name must start with a letter and can only use letters, spaces, periods (.), hyphens (-), and apostrophes (‘)",
  },

  email: {
    regex: /^\S+@\S+\.\S+$/,
    msg: "Please enter a valid email address",
  },

  password: {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    msg: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number",
  },

  currency: {
    regex: /^[A-Z]{3}$/,
    msg: "Currency must be a 3-letter code in capital letters",
  },

  httpURL: {
    regex:
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    msg: "Please enter a valid URL starting with http:// or https://",
  },
};
