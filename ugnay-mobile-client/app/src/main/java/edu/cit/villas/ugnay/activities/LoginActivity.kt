package edu.cit.villas.ugnay.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import edu.cit.villas.ugnay.R
import edu.cit.villas.ugnay.data.model.LoginRequest
import edu.cit.villas.ugnay.data.network.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class LoginActivity : AppCompatActivity() {

    private lateinit var inputEmail: TextInputEditText
    private lateinit var inputPassword: TextInputEditText
    private lateinit var btnLogin: MaterialButton
    private lateinit var tvError: TextView
    private lateinit var tvSuccess: TextView
    private lateinit var tvGoToRegister: TextView
    private lateinit var progressBar: ProgressBar

    private val apiService = ApiService.create()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        inputEmail = findViewById(R.id.inputEmail)
        inputPassword = findViewById(R.id.inputPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvError = findViewById(R.id.tvError)
        tvSuccess = findViewById(R.id.tvSuccess)
        tvGoToRegister = findViewById(R.id.tvGoToRegister)
        progressBar = findViewById(R.id.progressBar)

        btnLogin.setOnClickListener { handleLogin() }
        tvGoToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun handleLogin() {
        val email = inputEmail.text?.toString()?.trim().orEmpty()
        val password = inputPassword.text?.toString().orEmpty()

        if (email.isBlank() || password.isBlank()) {
            showError("Please fill in all fields.")
            return
        }

        hideSuccess()
        hideError()
        setLoading(true)

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    apiService.login(LoginRequest(email = email, password = password))
                }

                if (response.isSuccessful) {
                    val auth = response.body()
                    if (auth != null) {
                        showSuccess("Login successful. Redirecting to home...")
                        delay(900)
                        val homeIntent = Intent(this@LoginActivity, MainXmlActivity::class.java).apply {
                            putExtra(MainXmlActivity.EXTRA_ROLE, auth.role)
                            putExtra(MainXmlActivity.EXTRA_USER_ID, auth.userId)
                        }
                        startActivity(homeIntent)
                        finish()
                    } else {
                        showError("Invalid response from server.")
                    }
                } else {
                    showError(parseErrorBody(response.errorBody()?.string()) ?: "Login failed.")
                }
            } catch (e: Exception) {
                showError(e.message ?: "A network error occurred.")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun setLoading(isLoading: Boolean) {
        btnLogin.isEnabled = !isLoading
        btnLogin.text = if (isLoading) "Signing In..." else "SIGN IN"
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
    }

    private fun showError(message: String) {
        hideSuccess()
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }

    private fun showSuccess(message: String) {
        tvSuccess.text = message
        tvSuccess.visibility = View.VISIBLE
    }

    private fun hideError() {
        tvError.visibility = View.GONE
    }

    private fun hideSuccess() {
        tvSuccess.visibility = View.GONE
    }

    private fun parseErrorBody(errorBody: String?): String? {
        if (errorBody.isNullOrBlank()) return null
        return try {
            val json = JSONObject(errorBody)
            json.optString("message").takeIf { it.isNotBlank() }
                ?: json.optString("error").takeIf { it.isNotBlank() }
                ?: errorBody.take(200)
        } catch (_: Exception) {
            errorBody.take(200)
        }
    }
}
