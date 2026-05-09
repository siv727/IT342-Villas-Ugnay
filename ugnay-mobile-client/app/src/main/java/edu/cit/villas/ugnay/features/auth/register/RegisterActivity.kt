package edu.cit.villas.ugnay.features.auth.register

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.button.MaterialButtonToggleGroup
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import edu.cit.villas.ugnay.R
import edu.cit.villas.ugnay.features.auth.register.RegistrationRequest
import edu.cit.villas.ugnay.shared.data.network.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class RegisterActivity : AppCompatActivity() {

    private lateinit var roleToggleGroup: MaterialButtonToggleGroup
    private lateinit var btnRoleVendor: MaterialButton
    private lateinit var btnRoleManufacturer: MaterialButton
    private lateinit var vendorTypeContainer: View
    private lateinit var vendorTypeToggleGroup: MaterialButtonToggleGroup
    private lateinit var btnVendorTypeRetail: MaterialButton
    private lateinit var btnVendorTypeFood: MaterialButton
    private lateinit var manufacturerCategoryLayout: TextInputLayout

    private lateinit var inputBusinessName: TextInputEditText
    private lateinit var inputEmail: TextInputEditText
    private lateinit var inputPassword: TextInputEditText
    private lateinit var inputConfirmPassword: TextInputEditText
    private lateinit var inputBusinessAddress: TextInputEditText
    private lateinit var inputBusinessPermit: TextInputEditText
    private lateinit var inputDescription: TextInputEditText
    private lateinit var inputManufacturerCategory: TextInputEditText

    private lateinit var btnRegister: MaterialButton
    private lateinit var tvError: TextView
    private lateinit var tvSuccess: TextView
    private lateinit var tvGoToLogin: TextView
    private lateinit var progressBar: ProgressBar

    private val apiService = ApiService.create()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        roleToggleGroup = findViewById(R.id.roleToggleGroup)
        btnRoleVendor = findViewById(R.id.btnRoleVendor)
        btnRoleManufacturer = findViewById(R.id.btnRoleManufacturer)
        vendorTypeContainer = findViewById(R.id.vendorTypeContainer)
        vendorTypeToggleGroup = findViewById(R.id.vendorTypeToggleGroup)
        btnVendorTypeRetail = findViewById(R.id.btnVendorTypeRetail)
        btnVendorTypeFood = findViewById(R.id.btnVendorTypeFood)
        manufacturerCategoryLayout = findViewById(R.id.manufacturerCategoryLayout)

        inputBusinessName = findViewById(R.id.inputBusinessName)
        inputEmail = findViewById(R.id.inputEmail)
        inputPassword = findViewById(R.id.inputPassword)
        inputConfirmPassword = findViewById(R.id.inputConfirmPassword)
        inputBusinessAddress = findViewById(R.id.inputBusinessAddress)
        inputBusinessPermit = findViewById(R.id.inputBusinessPermit)
        inputDescription = findViewById(R.id.inputDescription)
        inputManufacturerCategory = findViewById(R.id.inputManufacturerCategory)

        btnRegister = findViewById(R.id.btnRegister)
        tvError = findViewById(R.id.tvError)
        tvSuccess = findViewById(R.id.tvSuccess)
        tvGoToLogin = findViewById(R.id.tvGoToLogin)
        progressBar = findViewById(R.id.progressBar)

        roleToggleGroup.check(R.id.btnRoleVendor)
        vendorTypeToggleGroup.check(R.id.btnVendorTypeRetail)

        roleToggleGroup.addOnButtonCheckedListener { _, checkedId, isChecked ->
            if (!isChecked) return@addOnButtonCheckedListener
            val isVendor = checkedId == R.id.btnRoleVendor
            vendorTypeContainer.visibility = if (isVendor) View.VISIBLE else View.GONE
            manufacturerCategoryLayout.visibility = if (isVendor) View.GONE else View.VISIBLE
        }

        btnRegister.setOnClickListener { handleRegister() }
        tvGoToLogin.setOnClickListener { finish() }
    }

    private fun handleRegister() {
        val businessName = inputBusinessName.text?.toString()?.trim().orEmpty()
        val email = inputEmail.text?.toString()?.trim().orEmpty()
        val password = inputPassword.text?.toString().orEmpty()
        val confirmPassword = inputConfirmPassword.text?.toString().orEmpty()
        val businessAddress = inputBusinessAddress.text?.toString()?.trim().orEmpty()
        val businessPermit = inputBusinessPermit.text?.toString()?.trim().orEmpty()
        val description = inputDescription.text?.toString()?.trim().orEmpty()
        val manufacturerCategory = inputManufacturerCategory.text?.toString()?.trim().orEmpty()

        val role = when (roleToggleGroup.checkedButtonId) {
            R.id.btnRoleManufacturer -> "MANUFACTURER"
            else -> "VENDOR"
        }
        val vendorType = when (vendorTypeToggleGroup.checkedButtonId) {
            R.id.btnVendorTypeFood -> "FOOD"
            else -> "RETAIL"
        }

        if (businessName.isBlank() || email.isBlank() || password.isBlank() || confirmPassword.isBlank() || businessAddress.isBlank()) {
            showError("Please complete required fields.")
            return
        }
        if (password != confirmPassword) {
            showError("Passwords do not match.")
            return
        }
        if (role == "MANUFACTURER" && manufacturerCategory.isBlank()) {
            showError("Category is required for manufacturer accounts.")
            return
        }

        hideSuccess()
        hideError()
        setLoading(true)

        val request = RegistrationRequest(
            email = email,
            password = password,
            businessName = businessName,
            businessAddress = businessAddress,
            businessPermit = businessPermit.ifBlank { null },
            description = description.ifBlank { null },
            role = role,
            category = if (role == "MANUFACTURER") manufacturerCategory else null,
            type = if (role == "VENDOR") vendorType else null,
        )

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    apiService.register(request)
                }

                if (response.isSuccessful) {
                    showSuccess("Registration successful. Returning to sign in...")
                    delay(900)
                    finish()
                } else {
                    showError(parseErrorBody(response.errorBody()?.string()) ?: "Registration failed.")
                }
            } catch (e: Exception) {
                showError(e.message ?: "A network error occurred.")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun setLoading(isLoading: Boolean) {
        btnRegister.isEnabled = !isLoading
        btnRegister.text = if (isLoading) "Creating..." else "CREATE ACCOUNT"
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
