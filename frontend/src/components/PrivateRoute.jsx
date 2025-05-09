import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
	const { token, user } = useAuth();

	// If no token or user, redirect to login with replace
	if (!token || !user?._id) {
		return <Navigate to="/home" replace />;
	}

	// If authenticated, render children
	return children;
}
