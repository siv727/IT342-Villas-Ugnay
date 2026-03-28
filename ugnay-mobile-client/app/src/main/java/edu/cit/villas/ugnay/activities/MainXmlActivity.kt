package edu.cit.villas.ugnay.activities

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.button.MaterialButton
import edu.cit.villas.ugnay.R
import edu.cit.villas.ugnay.data.network.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainXmlActivity : AppCompatActivity() {

    private lateinit var tvTopTitle: TextView
    private lateinit var btnSearch: ImageButton
    private lateinit var tvGreetingRole: TextView
    private lateinit var tvSubGreeting: TextView
    private lateinit var tvRecentTitle: TextView
    private lateinit var tvViewAllRecent: TextView
    private lateinit var tvStatOne: TextView
    private lateinit var tvStatTwo: TextView
    private lateinit var tvStatThree: TextView
    private lateinit var tvStatFour: TextView
    private lateinit var tvStatOneLabel: TextView
    private lateinit var tvStatTwoLabel: TextView
    private lateinit var tvStatThreeLabel: TextView
    private lateinit var tvStatFourLabel: TextView
    private lateinit var tvRecentOneTitle: TextView
    private lateinit var tvRecentOneSub: TextView
    private lateinit var tvRecentOneStatus: TextView
    private lateinit var tvRecentTwoTitle: TextView
    private lateinit var tvRecentTwoSub: TextView
    private lateinit var tvRecentTwoStatus: TextView
    private lateinit var tvRecentThreeTitle: TextView
    private lateinit var tvRecentThreeSub: TextView
    private lateinit var tvRecentThreeStatus: TextView
    private lateinit var tvRequestsSubtitle: TextView
    private lateinit var tvReqOneTitle: TextView
    private lateinit var tvReqOneSub: TextView
    private lateinit var tvReqTwoTitle: TextView
    private lateinit var tvReqTwoSub: TextView
    private lateinit var tvProfileRole: TextView
    private lateinit var tvProfileHint: TextView
    private lateinit var tvPrimaryCta: MaterialButton
    private lateinit var btnPrimaryCta: MaterialButton
    private lateinit var btnLogout: MaterialButton
    private lateinit var logoutProgress: ProgressBar
    private lateinit var sectionHome: LinearLayout
    private lateinit var sectionRequests: LinearLayout
    private lateinit var sectionProfile: LinearLayout
    private lateinit var tabHome: LinearLayout
    private lateinit var tabRequests: LinearLayout
    private lateinit var tabProfile: LinearLayout
    private lateinit var iconTabHome: ImageView
    private lateinit var iconTabRequests: ImageView
    private lateinit var iconTabProfile: ImageView
    private lateinit var labelTabHome: TextView
    private lateinit var labelTabRequests: TextView
    private lateinit var labelTabProfile: TextView

    private val apiService = ApiService.create()
    private var currentRole = "VENDOR"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main_xml)

        tvTopTitle = findViewById(R.id.tvTopTitle)
        btnSearch = findViewById(R.id.btnSearch)
        tvGreetingRole = findViewById(R.id.tvGreetingRole)
        tvSubGreeting = findViewById(R.id.tvSubGreeting)
        tvRecentTitle = findViewById(R.id.tvRecentTitle)
        tvViewAllRecent = findViewById(R.id.tvViewAllRecent)
        tvStatOne = findViewById(R.id.tvStatOne)
        tvStatTwo = findViewById(R.id.tvStatTwo)
        tvStatThree = findViewById(R.id.tvStatThree)
        tvStatFour = findViewById(R.id.tvStatFour)
        tvStatOneLabel = findViewById(R.id.tvStatOneLabel)
        tvStatTwoLabel = findViewById(R.id.tvStatTwoLabel)
        tvStatThreeLabel = findViewById(R.id.tvStatThreeLabel)
        tvStatFourLabel = findViewById(R.id.tvStatFourLabel)
        tvRecentOneTitle = findViewById(R.id.tvRecentOneTitle)
        tvRecentOneSub = findViewById(R.id.tvRecentOneSub)
        tvRecentOneStatus = findViewById(R.id.tvRecentOneStatus)
        tvRecentTwoTitle = findViewById(R.id.tvRecentTwoTitle)
        tvRecentTwoSub = findViewById(R.id.tvRecentTwoSub)
        tvRecentTwoStatus = findViewById(R.id.tvRecentTwoStatus)
        tvRecentThreeTitle = findViewById(R.id.tvRecentThreeTitle)
        tvRecentThreeSub = findViewById(R.id.tvRecentThreeSub)
        tvRecentThreeStatus = findViewById(R.id.tvRecentThreeStatus)
        tvRequestsSubtitle = findViewById(R.id.tvRequestsSubtitle)
        tvReqOneTitle = findViewById(R.id.tvReqOneTitle)
        tvReqOneSub = findViewById(R.id.tvReqOneSub)
        tvReqTwoTitle = findViewById(R.id.tvReqTwoTitle)
        tvReqTwoSub = findViewById(R.id.tvReqTwoSub)
        tvProfileRole = findViewById(R.id.tvProfileRole)
        tvProfileHint = findViewById(R.id.tvProfileHint)
        btnPrimaryCta = findViewById(R.id.btnPrimaryCta)
        tvPrimaryCta = btnPrimaryCta
        btnLogout = findViewById(R.id.btnLogout)
        logoutProgress = findViewById(R.id.logoutProgress)
        sectionHome = findViewById(R.id.sectionHome)
        sectionRequests = findViewById(R.id.sectionRequests)
        sectionProfile = findViewById(R.id.sectionProfile)
        tabHome = findViewById(R.id.tabHome)
        tabRequests = findViewById(R.id.tabRequests)
        tabProfile = findViewById(R.id.tabProfile)
        iconTabHome = findViewById(R.id.iconTabHome)
        iconTabRequests = findViewById(R.id.iconTabRequests)
        iconTabProfile = findViewById(R.id.iconTabProfile)
        labelTabHome = findViewById(R.id.labelTabHome)
        labelTabRequests = findViewById(R.id.labelTabRequests)
        labelTabProfile = findViewById(R.id.labelTabProfile)

        bindRoleDashboard(intent.getStringExtra(EXTRA_ROLE).orEmpty())
        btnSearch.setOnClickListener {
            Toast.makeText(this, "Search screen will be connected next.", Toast.LENGTH_SHORT).show()
        }
        tvViewAllRecent.setOnClickListener { selectTab(Tab.REQUESTS) }
        tabHome.setOnClickListener { selectTab(Tab.HOME) }
        tabRequests.setOnClickListener { selectTab(Tab.REQUESTS) }
        tabProfile.setOnClickListener { selectTab(Tab.PROFILE) }
        btnLogout.setOnClickListener { handleLogout() }
        selectTab(Tab.HOME)
    }

    private fun bindRoleDashboard(roleValue: String) {
        val role = roleValue.uppercase()
        currentRole = if (role == "MANUFACTURER") "MANUFACTURER" else "VENDOR"
        val isManufacturer = role == "MANUFACTURER"

        tvGreetingRole.text = if (isManufacturer) "Manufacturer" else "Vendor"
        tvSubGreeting.text = if (isManufacturer) {
            "Manage products and monitor incoming requests."
        } else {
            "Track requests and discover manufacturers."
        }

        tvStatOne.text = "3"
        tvStatTwo.text = "2"
        tvStatThree.text = "6"
        tvStatFour.text = "4"

        if (isManufacturer) {
            tvTopTitle.text = "Manufacturer Home"
            tvStatOneLabel.text = "Pending"
            tvStatTwoLabel.text = "In Transit"
            tvStatThreeLabel.text = "Products"
            tvStatFourLabel.text = "Vendors"
            btnPrimaryCta.text = "MANAGE PRODUCTS"
            tvRecentTitle.text = "Recent Incoming Requests"
            tvRecentOneTitle.text = "Raw Cacao Beans"
            tvRecentOneSub.text = "Metro Retail Solutions"
            tvRecentOneStatus.text = "Pending"
            tvRecentTwoTitle.text = "Virgin Coconut Oil"
            tvRecentTwoSub.text = "Bayanihan Grocer"
            tvRecentTwoStatus.text = "Approved"
            tvRecentThreeTitle.text = "Dried Pineapple"
            tvRecentThreeSub.text = "Island Traders"
            tvRecentThreeStatus.text = "In Transit"

            tvRequestsSubtitle.text = "Review and manage incoming requests from vendors."
            tvReqOneTitle.text = "Raw Cacao Beans - Metro Retail Solutions"
            tvReqOneSub.text = "Requested 2026-03-24"
            tvReqTwoTitle.text = "Virgin Coconut Oil - Bayanihan Grocer"
            tvReqTwoSub.text = "Requested 2026-03-20"

            tvProfileRole.text = "Manufacturer Account"
            tvProfileHint.text = "Manage business profile, product catalog, and shipment settings."
        } else {
            tvTopTitle.text = "Vendor Home"
            tvStatOneLabel.text = "Pending"
            tvStatTwoLabel.text = "In Transit"
            tvStatThreeLabel.text = "Completed"
            tvStatFourLabel.text = "Saved"
            btnPrimaryCta.text = "DISCOVER MANUFACTURERS"
            tvRecentTitle.text = "Recent Requests"
            tvRecentOneTitle.text = "Coconut Sugar"
            tvRecentOneSub.text = "Fresh Farms Manufacturing"
            tvRecentOneStatus.text = "Pending"
            tvRecentTwoTitle.text = "Dried Mango"
            tvRecentTwoSub.text = "Island Harvest Co."
            tvRecentTwoStatus.text = "In Transit"
            tvRecentThreeTitle.text = "Banana Chips"
            tvRecentThreeSub.text = "Golden Tropics Food Corp."
            tvRecentThreeStatus.text = "Completed"

            tvRequestsSubtitle.text = "Track your latest request statuses."
            tvReqOneTitle.text = "Coconut Sugar - Fresh Farms Manufacturing"
            tvReqOneSub.text = "Requested 2026-03-24"
            tvReqTwoTitle.text = "Dried Mango - Island Harvest Co."
            tvReqTwoSub.text = "Requested 2026-03-21"

            tvProfileRole.text = "Vendor Account"
            tvProfileHint.text = "Manage business profile, connections, and request preferences."
        }

        btnPrimaryCta.setOnClickListener {
            Toast.makeText(this, "Feature screen will be connected next.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun handleLogout() {
        setLogoutLoading(true)

        CoroutineScope(Dispatchers.Main).launch {
            try {
                withContext(Dispatchers.IO) {
                    apiService.logout()
                }
            } catch (_: Exception) {
                // Always clear local navigation state even if network logout fails.
            } finally {
                setLogoutLoading(false)
                val loginIntent = Intent(this@MainXmlActivity, LoginActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                }
                startActivity(loginIntent)
                finish()
            }
        }
    }

    private fun setLogoutLoading(isLoading: Boolean) {
        btnLogout.isEnabled = !isLoading
        btnLogout.text = if (isLoading) "Signing Out..." else "SIGN OUT"
        logoutProgress.visibility = if (isLoading) View.VISIBLE else View.GONE
    }

    private fun selectTab(tab: Tab) {
        sectionHome.visibility = if (tab == Tab.HOME) View.VISIBLE else View.GONE
        sectionRequests.visibility = if (tab == Tab.REQUESTS) View.VISIBLE else View.GONE
        sectionProfile.visibility = if (tab == Tab.PROFILE) View.VISIBLE else View.GONE

        styleTab(tabHome, iconTabHome, labelTabHome, tab == Tab.HOME)
        styleTab(tabRequests, iconTabRequests, labelTabRequests, tab == Tab.REQUESTS)
        styleTab(tabProfile, iconTabProfile, labelTabProfile, tab == Tab.PROFILE)

        tvTopTitle.text = when (tab) {
            Tab.HOME -> if (currentRole == "MANUFACTURER") "Manufacturer Home" else "Vendor Home"
            Tab.REQUESTS -> "Requests"
            Tab.PROFILE -> "Profile"
        }
    }

    private fun styleTab(tabView: LinearLayout, iconView: ImageView, labelView: TextView, isSelected: Boolean) {
        val activeColor = ContextCompat.getColor(this, R.color.auth_primary)
        val inactiveColor = ContextCompat.getColor(this, R.color.auth_text_muted)

        if (isSelected) {
            tabView.setBackgroundResource(R.drawable.bg_surface_variant_rounded)
            iconView.setColorFilter(activeColor)
            labelView.setTextColor(activeColor)
            labelView.textSize = 10f
        } else {
            tabView.setBackgroundColor(ContextCompat.getColor(this, android.R.color.transparent))
            iconView.setColorFilter(inactiveColor)
            labelView.setTextColor(inactiveColor)
            labelView.textSize = 10f
        }
    }

    private enum class Tab {
        HOME,
        REQUESTS,
        PROFILE,
    }

    companion object {
        const val EXTRA_ROLE = "extra_role"
        const val EXTRA_USER_ID = "extra_user_id"
    }
}
