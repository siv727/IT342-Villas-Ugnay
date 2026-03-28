package edu.cit.villas.ugnay.data.network

import edu.cit.villas.ugnay.data.model.AuthResponse
import edu.cit.villas.ugnay.data.model.LoginRequest
import edu.cit.villas.ugnay.data.model.RegistrationRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: RegistrationRequest): Response<AuthResponse>

    @POST("api/auth/logout")
    suspend fun logout(): Response<Any>

    companion object {
        fun create(): ApiService = RetrofitClient.instance.create(ApiService::class.java)
    }
}
