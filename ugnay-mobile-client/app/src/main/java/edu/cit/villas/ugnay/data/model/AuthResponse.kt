package edu.cit.villas.ugnay.data.model

data class AuthResponse(
    val userId: Long,
    val role: String,
    val message: String,
)
