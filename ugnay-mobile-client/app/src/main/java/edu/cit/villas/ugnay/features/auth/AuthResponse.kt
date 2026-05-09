package edu.cit.villas.ugnay.features.auth

data class AuthResponse(
    val userId: Long,
    val role: String,
    val message: String,
)
