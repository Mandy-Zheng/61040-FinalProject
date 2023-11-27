import FriendConcept from "./concepts/friend";
import MembershipConcept from "./concepts/membership";
import PostConcept from "./concepts/post";
import StockConcept from "./concepts/stock";
import TeamConcept from "./concepts/team";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Membership = new MembershipConcept();
export const Team = new TeamConcept();
export const Stock = new StockConcept();
