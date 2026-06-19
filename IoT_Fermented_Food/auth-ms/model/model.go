package model

// User Credentials of a certain user
type User struct {
	Username     string `json:"username"`
	Password     string `json:"password"`
	RefreshToken string `json:"refreshToken"`
}

// Credential New Tokens for a certain user
type Credential struct {
	Username        string `json:"username"`
	RefreshToken    string `json:"refreshToken"`
	NewRefreshToken string `json:"newRefreshToken"`
}
