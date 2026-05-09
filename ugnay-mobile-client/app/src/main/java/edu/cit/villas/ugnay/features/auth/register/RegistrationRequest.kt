package edu.cit.villas.ugnay.features.auth.register

data class RegistrationRequest(
    val email: String,
    val password: String,
    val businessName: String,
    val businessAddress: String,
    val businessPermit: String? = null,
    val description: String? = null,
    val role: String,
    val category: String? = null,
    val type: String? = null,
)
