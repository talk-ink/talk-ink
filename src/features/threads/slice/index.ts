import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment-timezone";
import { Thread, IComment, ISubComment } from "types";
import { filterDistinct } from "utils/helper";
import {
  createComment,
  fetchComments,
  fetchThreads,
  fetchThreadsPagination,
} from "./asyncThunk";

type InitThreadState = {
  threads: Thread[];
  loading: boolean;
  commentLoading: boolean;
  commentCount: number;
  threadCount: number;
};

type TCommentsPayload = {
  comments: IComment[];
  threadId: string;
  count?: number;
};

type TCommentPayload = {
  comment: IComment;
  threadId: string;
};
type TUpdateTempCommentPayload = {
  comment: IComment;
  threadId: string;
  _tempId: string;
};

type TDeleteCommentPayload = {
  deletedId: string;
  threadId: string;
};

type TInteractedUserPayload = {
  userId: string;
  threadId: string;
};

type TSubCommentsPayload = {
  subComment: ISubComment;
  commentId: string;
  threadId: string;
};

type TSubCommentsDeletePayload = {
  subCommentId: string;
  commentId: string;
  threadId: string;
};

type IUpdateThreadCommentPayload = {
  thread: Thread;
  comments: Comment[];
};

const initialState: InitThreadState = {
  threads: [],
  loading: true,
  commentLoading: true,
  commentCount: 0,
  threadCount: 0,
};

interface IUpdateThreadPayload extends Omit<Thread, "closedAt"> {
  closedAt?: string;
}

interface IPartialUpdateThreadPayload extends Omit<Thread, "name" | "content"> {
  name?: string;
  content?: string;
}

const threadSlice = createSlice({
  name: "thread",
  initialState,
  reducers: {
    addThread: (state, action: PayloadAction<Thread>) => {
      const newThread = [...state.threads, action.payload];

      const distinctThreads = filterDistinct(newThread, "_id");

      state.threads = distinctThreads;
    },
    bulkAddThread: (state, action: PayloadAction<Thread[]>) => {
      const newThread = [...state.threads, ...action.payload];

      const distinctThreads = filterDistinct(newThread, "_id");

      state.threads = distinctThreads;
    },
    deleteThread: (state, action: PayloadAction<Thread>) => {
      let deletedIndex = state.threads.findIndex(
        (data) => data._id === action.payload._id
      );
      if (deletedIndex >= 0) {
        state.threads.splice(deletedIndex, 1);
      }
    },
    updateThread: (state, action: PayloadAction<IUpdateThreadPayload>) => {
      const updatedThread = state.threads.map((item) =>
        item._id === action.payload._id ? action.payload : item
      );
      state.threads = updatedThread;
    },
    updatePartialThread: (
      state,
      action: PayloadAction<IPartialUpdateThreadPayload>
    ) => {
      const updatedThread = state.threads.map((item) => {
        if (item?._id !== action.payload?._id) return item;
        return {
          ...item,
          ...action.payload,
        };
      });
      state.threads = updatedThread;
    },
    updateThreadComment: (
      state,
      action: PayloadAction<IUpdateThreadCommentPayload>
    ) => {
      const updatedThread = state.threads.map((item) => {
        if (item._id === action.payload.thread._id) {
          const newComment =
            item.comments?.length > 0
              ? [...action.payload.comments, ...item.comments]
              : action.payload.comments;

          const distinctComments = filterDistinct(newComment, "_id");

          return {
            ...item,
            ...action.payload.thread,
            comments: distinctComments
              .filter((item) => item.createdBy._id)
              .sort(
                (a, b) =>
                  moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf()
              ),
          };
        } else {
          return item;
        }
      });

      state.threads = updatedThread;
    },
    addComment: (state, action: PayloadAction<TCommentPayload>) => {
      const newThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: [...item.comments, action.payload.comment],
            }
          : item
      );

      state.threads = newThread;
      state.commentCount = state.commentCount + 1;
    },
    updateComment: (state, action: PayloadAction<TCommentPayload>) => {
      const updatedThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: item.comments.map((comment) =>
                comment._id === action.payload.comment._id
                  ? action.payload.comment
                  : comment
              ),
            }
          : item
      );

      state.threads = updatedThread;
    },
    updateTempComment: (
      state,
      action: PayloadAction<TUpdateTempCommentPayload>
    ) => {
      const updatedThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: item.comments.map((comment) => {
                if (!comment?._tempId) return comment;
                if (comment?._tempId !== action.payload._tempId) return comment;
                return { ...comment, ...action.payload.comment };
              }),
            }
          : item
      );

      state.threads = updatedThread;
    },
    deleteComment: (state, action: PayloadAction<TDeleteCommentPayload>) => {
      const filteredThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: item.comments.filter(
                (comment) => comment._id !== action.payload.deletedId
              ),
            }
          : item
      );

      state.threads = filteredThread;
      state.commentCount = state.commentCount - 1;
    },
    addInteractedUser: (
      state,
      action: PayloadAction<TInteractedUserPayload>
    ) => {
      const newThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              interactedUsers: item.interactedUsers
                ? [...item.interactedUsers, action.payload.userId]
                : [action.payload.userId],
            }
          : item
      );

      state.threads = newThread;
    },
    refetchComment: (state, action: PayloadAction<TCommentsPayload>) => {
      console.log("refetchComment", action.payload);
      const newThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: action.payload.comments,
            }
          : item
      );

      state.threads = newThread;
    },
    addSubCommentToComment: (
      state,
      action: PayloadAction<TSubCommentsPayload>
    ) => {
      const newThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: item.comments?.map((comment) =>
                comment._id === action.payload.commentId
                  ? {
                      ...comment,
                      subComments:
                        comment.subComments.length > 0
                          ? [...comment.subComments, action.payload.subComment]
                          : [action.payload.subComment],
                    }
                  : comment
              ),
            }
          : item
      );

      state.threads = newThread;
    },
    updateSubCommentToComment: (
      state,
      action: PayloadAction<TSubCommentsPayload>
    ) => {
      const newThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: item.comments?.map((comment) =>
                comment._id === action.payload.commentId
                  ? {
                      ...comment,
                      subComments: comment.subComments.map((subComment) =>
                        subComment._id === action.payload.subComment._id
                          ? action.payload.subComment
                          : subComment
                      ),
                    }
                  : comment
              ),
            }
          : item
      );

      state.threads = newThread;
    },
    updateTempSubCommentToComment: (
      state,
      action: PayloadAction<TSubCommentsPayload>
    ) => {
      const newThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: item.comments?.map((comment) =>
                comment._id === action.payload.commentId
                  ? {
                      ...comment,
                      subComments: comment.subComments.map((subComment) => {
                        if (!subComment?._tempId) return subComment;
                        if (
                          subComment?._tempId !==
                          action.payload.subComment._tempId
                        )
                          return subComment;

                        return {
                          ...subComment,
                          _id: action.payload.subComment._id,
                        };
                      }),
                    }
                  : comment
              ),
            }
          : item
      );

      state.threads = newThread;
    },
    deleteSubCommentToComment: (
      state,
      action: PayloadAction<TSubCommentsDeletePayload>
    ) => {
      const newThread = state.threads.map((item) =>
        item._id === action.payload.threadId
          ? {
              ...item,
              comments: item.comments?.map((comment) =>
                comment._id === action.payload.commentId
                  ? {
                      ...comment,
                      subComments: comment.subComments.filter(
                        (subComment) =>
                          subComment._id !== action.payload.subCommentId
                      ),
                    }
                  : comment
              ),
            }
          : item
      );

      state.threads = newThread;
    },
  },
  extraReducers: (builder) => {
    //fetch thread
    builder.addCase(fetchThreads.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      fetchThreads.fulfilled,
      (state, action: PayloadAction<{ data: Thread[]; total: number }>) => {
        state.threads = action.payload.data;
        state.threadCount = action.payload.total;
        state.loading = false;
      }
    );
    builder.addCase(
      fetchThreadsPagination.fulfilled,
      (state, action: PayloadAction<Thread[]>) => {
        state.threads = [...state.threads, ...action.payload];
        state.loading = false;
      }
    );
    builder.addCase(fetchThreads.rejected, (state) => {
      state.loading = false;
    });

    //fetch comment
    builder.addCase(fetchComments.pending, (state) => {
      state.commentLoading = true;
    });
    builder.addCase(
      fetchComments.fulfilled,
      (state, action: PayloadAction<TCommentsPayload>) => {
        const newThread = state.threads.map((item) => {
          if (item._id === action.payload.threadId) {
            const newComment =
              item.comments?.length > 0
                ? [...action.payload.comments, ...item.comments]
                : action.payload.comments;

            const distinctComments = filterDistinct(newComment, "_id");

            return {
              ...item,
              comments: distinctComments
                .filter((item) => item.createdBy._id)
                .sort(
                  (a, b) =>
                    moment(a.createdAt).valueOf() -
                    moment(b.createdAt).valueOf()
                ),
            };
          } else {
            return item;
          }
        });

        state.threads = newThread;
        state.commentLoading = false;
        state.commentCount = action.payload.count;
      }
    );
    builder.addCase(fetchComments.rejected, (state) => {
      state.commentLoading = false;
    });
    builder.addCase(
      createComment.fulfilled,
      (state, action: PayloadAction<IComment>) => {
        const threadId = action.payload.threads[0];

        const updatedThread = state.threads.map((item) =>
          item._id === threadId
            ? {
                ...item,
                comments: item.comments.map((comment) => {
                  if (!comment?._tempId) return comment;
                  if (comment?._tempId !== action.payload._tempId)
                    return comment;

                  return { ...comment, _id: action.payload._id };
                }),
              }
            : item
        );

        state.threads = updatedThread;
      }
    );
  },
});

export const {
  addThread,
  bulkAddThread,
  deleteThread,
  updateThread,
  addComment,
  deleteComment,
  updateComment,
  addInteractedUser,
  refetchComment,
  addSubCommentToComment,
  updateSubCommentToComment,
  deleteSubCommentToComment,
  updateThreadComment,
  updatePartialThread,
  updateTempSubCommentToComment,
} = threadSlice.actions;
export const threadReducer = threadSlice.reducer;
