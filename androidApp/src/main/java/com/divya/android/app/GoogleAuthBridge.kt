package com.divya.android.app

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import com.divya.android.BuildConfig
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

object GoogleAuthBridge {
    suspend fun getGoogleIdToken(activity: Activity): String {
        val clientId = BuildConfig.GOOGLE_WEB_CLIENT_ID.trim()
        require(clientId.isNotBlank()) {
            "Google login is not configured in this build. Set GOOGLE_WEB_CLIENT_ID."
        }

        val googleIdOption = GetGoogleIdOption.Builder()
            .setServerClientId(clientId)
            .setFilterByAuthorizedAccounts(false)
            .setAutoSelectEnabled(false)
            .build()
        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()
        val credentialManager = CredentialManager.create(activity)
        val result = credentialManager.getCredential(activity, request)
        val credential = result.credential
        if (credential !is CustomCredential || credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            error("Google sign-in did not return an ID token.")
        }
        return GoogleIdTokenCredential.createFrom(credential.data).idToken
    }
}
