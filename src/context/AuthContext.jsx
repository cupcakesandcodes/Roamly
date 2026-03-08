import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { googleProvider } from '../firebase';
import {
    doc, getDoc, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import {
    ref, uploadBytes, getDownloadURL
} from 'firebase/storage';

const AuthContext = createContext(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen to auth state
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const profile = await fetchProfile(user.uid);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    // ── Auth Methods ──

    async function signUpWithEmail(name, email, password, role) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        // Create initial profile doc
        await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            displayName: name,
            email: email,
            role: role, // 'traveler' or 'agent'
            profilePhoto: '',
            onboardingComplete: false,
            createdAt: serverTimestamp(),
        });
        const profile = await fetchProfile(cred.user.uid);
        setUserProfile(profile);
        return cred.user;
    }

    async function signInWithEmail(email, password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await fetchProfile(cred.user.uid);
        setUserProfile(profile);
        return cred.user;
    }

    async function signInWithGoogle(role) {
        const cred = await signInWithPopup(auth, googleProvider);
        // Check if profile exists, create if not
        const existing = await fetchProfile(cred.user.uid);
        if (!existing) {
            await setDoc(doc(db, 'users', cred.user.uid), {
                uid: cred.user.uid,
                displayName: cred.user.displayName || '',
                email: cred.user.email || '',
                role: role || 'traveler',
                profilePhoto: cred.user.photoURL || '',
                onboardingComplete: false,
                createdAt: serverTimestamp(),
            });
        }
        const profile = await fetchProfile(cred.user.uid);
        setUserProfile(profile);
        return { user: cred.user, isNew: !existing };
    }

    async function logout() {
        await signOut(auth);
        setCurrentUser(null);
        setUserProfile(null);
    }

    // ── Profile Methods ──

    async function fetchProfile(uid) {
        const snap = await getDoc(doc(db, 'users', uid));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }

    async function updateUserProfile(data) {
        if (!currentUser) throw new Error('Not authenticated');
        await updateDoc(doc(db, 'users', currentUser.uid), {
            ...data,
            updatedAt: serverTimestamp(),
        });
        const profile = await fetchProfile(currentUser.uid);
        setUserProfile(profile);
        return profile;
    }

    async function uploadProfilePhoto(file) {
        if (!currentUser) throw new Error('Not authenticated');
        const storageRef = ref(storage, `profilePhotos/${currentUser.uid}/${file.name}`);
        const snap = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snap.ref);
        await updateDoc(doc(db, 'users', currentUser.uid), { profilePhoto: url });
        await updateProfile(currentUser, { photoURL: url });
        const profile = await fetchProfile(currentUser.uid);
        setUserProfile(profile);
        return url;
    }

    async function completeOnboarding(profileData) {
        if (!currentUser) throw new Error('Not authenticated');
        await updateDoc(doc(db, 'users', currentUser.uid), {
            ...profileData,
            onboardingComplete: true,
            updatedAt: serverTimestamp(),
        });
        const profile = await fetchProfile(currentUser.uid);
        setUserProfile(profile);
        return profile;
    }

    const value = {
        currentUser,
        userProfile,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        logout,
        updateUserProfile,
        uploadProfilePhoto,
        completeOnboarding,
        fetchProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
